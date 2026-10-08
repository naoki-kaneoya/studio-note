import { NextResponse } from "next/server";
import { BookingValidationError, calculateMonthAvailability, NODA_LAST_BOOKING_DATE, todayInJapan, validateMonthAvailabilityQuery } from "@/lib/booking";
import { BOOKING_PUBLICATION_POLICY, callBookingBackend, getBookingBackendConfig } from "@/lib/google-booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const backend = getBookingBackendConfig();
  if (!backend) return NextResponse.json({ message: "現在、空き状況の確認は準備中です。管理者にお問い合わせください。" }, { status: 503, headers });
  const controller = new AbortController();
  const signal = AbortSignal.any([request.signal, controller.signal, AbortSignal.timeout(45000)]);
  try {
    const url = new URL(request.url);
    const now = new Date();
    const query = validateMonthAvailabilityQuery({ resource: url.searchParams.get("resource"), month: url.searchParams.get("month") }, now);
    const dates = query.dates.filter(date => date >= todayInJapan(now) && (query.resource !== "noda" || date <= NODA_LAST_BOOKING_DATE));
    const periods: unknown[] = [];
    if (dates.length) {
      const capability = await callBookingBackend(backend, { action: "capabilities" }, signal);
      if (capability.code !== "OK" || capability.bookingPolicy !== BOOKING_PUBLICATION_POLICY) {
        return NextResponse.json({ message: "現在、予約受付を調整しています。管理者にお問い合わせください。" }, { status: 503, headers });
      }
      const append = (result: Record<string, unknown>) => {
        if (result.code !== "OK" || result.bookingPolicy !== BOOKING_PUBLICATION_POLICY || !Array.isArray(result.busy)) throw new Error("Month availability unavailable");
        periods.push(...result.busy);
      };
      if (capability.monthlyAvailability === true) {
        const result = await callBookingBackend(backend, { action: "monthAvailability", availability: { resource: query.resource, month: query.month } }, signal);
        if (result.month !== query.month) throw new Error("Month response mismatch");
        append(result);
      } else {
        // 日単位の照会に対応した既存のGoogleコードでも表示できるようにする。
        let cursor = 0;
        await Promise.all(Array.from({ length: Math.min(6, dates.length) }, async () => {
          while (cursor < dates.length) {
            signal.throwIfAborted();
            const date = dates[cursor++];
            const result = await callBookingBackend(backend, { action: "availability", availability: { resource: query.resource, date } }, signal);
            append(result);
          }
        }));
      }
    }
    return NextResponse.json({ ok: true, availability: calculateMonthAvailability(query, periods, now) }, { headers });
  } catch (error) {
    controller.abort();
    if (error instanceof BookingValidationError) return NextResponse.json({ message: error.message }, { status: 400, headers });
    return NextResponse.json({ message: "月の予約状況を取得できませんでした。「月の状況を更新」から再度お試しください。" }, { status: 503, headers });
  }
}
