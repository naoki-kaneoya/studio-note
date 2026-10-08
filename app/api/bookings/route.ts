import { NextResponse } from "next/server";
import { BOOKING_RESOURCES, BookingValidationError, validateBooking } from "@/lib/booking";
import { BOOKING_PUBLICATION_POLICY, callBookingBackend, getBookingBackendConfig } from "@/lib/google-booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const messages: Record<string, { status: number; message: string }> = {
  CONFLICT: { status: 409, message: "その時間は既に予約が入っています。別の時間を選んでください。" },
  BUSY: { status: 503, message: "別の予約を処理中です。少し待って、同じ内容でもう一度お試しください。" },
  INVALID: { status: 400, message: "予約する日時と入力内容を確認してください。" },
  CANCELLED: { status: 409, message: "この予約はキャンセルされています。ページを開き直してお試しください。" },
  REQUEST_MISMATCH: { status: 409, message: "予約内容が変更されています。ページを開き直してお試しください。" },
};

function reply(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function readInput(req: Request): Promise<unknown> {
  if (!req.body) throw new BookingValidationError("予約内容を入力してください。");
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        throw new BookingValidationError("入力内容が長すぎます。");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new BookingValidationError("予約内容を確認してください。");
  }
}

export async function POST(req: Request) {
  const backend = getBookingBackendConfig();
  if (!backend) {
    return reply("現在、予約受付の準備中です。管理者にお問い合わせください。", 503);
  }
  // HTTPSトンネルではNext.jsが内部の127.0.0.1をURLとして受け取る。
  // 公開元は管理者の設定だけを信頼し、転送ヘッダーからは取得しない。
  let allowedOrigin = new URL(req.url).origin;
  const publicOrigin = process.env.BOOKING_SITE_ORIGIN;
  if (publicOrigin) {
    try {
      const url = new URL(publicOrigin);
      if (url.protocol !== "https:" || url.origin !== publicOrigin) throw new Error("Invalid origin");
      allowedOrigin = publicOrigin;
    } catch {
      return reply("現在、予約受付の準備中です。管理者にお問い合わせください。", 503);
    }
  }
  if (req.headers.get("origin") && req.headers.get("origin") !== allowedOrigin) {
    return reply("このページから予約を送信してください。", 403);
  }
  if (req.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return reply("予約内容を確認してください。", 415);
  }

  try {
    const input = await readInput(req);
    const booking = validateBooking(input, new Date());
    // 古いGoogle側コードには予約を渡さず、非公開の予定が新しく増えるのを防ぐ。
    const signal = AbortSignal.timeout(45000);
    const capability = await callBookingBackend(backend, { action: "capabilities" }, signal);
    if (capability.code !== "OK" || capability.bookingPolicy !== BOOKING_PUBLICATION_POLICY) {
      return reply("現在、予約受付を調整しています。管理者にお問い合わせください。", 503);
    }
    const result = await callBookingBackend(backend, { booking }, signal);
    if (result.code !== "OK") {
      const error = typeof result.code === "string" ? messages[result.code] : undefined;
      return reply(error?.message ?? "予約状況を確認できませんでした。同じ内容でもう一度お試しください。", error?.status ?? 503);
    }
    if (result.bookingPolicy !== BOOKING_PUBLICATION_POLICY || result.visibility !== "public" || result.transparency !== "opaque") {
      return reply("予約の公開状態を確認できませんでした。入力を変えずに、もう一度お試しください。", 503);
    }
    return NextResponse.json({
      ok: true,
      booking: {
        resource: booking.resource,
        resourceName: BOOKING_RESOURCES.find((resource) => resource.id === booking.resource)?.name,
        name: booking.name, email: booking.email, date: booking.date, startTime: booking.startTime, endTime: booking.endTime,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof BookingValidationError) return reply(error.message, 400);
    // 招待の登録後に応答だけ失われることもある。同じrequestIdで再送する。
    return reply("予約結果を確認できませんでした。入力を変えずに、もう一度お試しください。", 503);
  }
}
