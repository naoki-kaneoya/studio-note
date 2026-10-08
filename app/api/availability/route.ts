import { NextResponse } from "next/server";
import { BookingValidationError, calculateDayAvailability, validateAvailabilityQuery } from "@/lib/booking";
import { BOOKING_PUBLICATION_POLICY, callBookingBackend, getBookingBackendConfig } from "@/lib/google-booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const backend = getBookingBackendConfig();
  if (!backend) return NextResponse.json({ message: "現在、空き状況の確認は準備中です。管理者にお問い合わせください。" }, { status: 503, headers });
  try {
    const url = new URL(request.url);
    const query = validateAvailabilityQuery({ resource: url.searchParams.get("resource"), date: url.searchParams.get("date") }, new Date());
    const result = await callBookingBackend(backend, { action: "availability", availability: { resource: query.resource, date: query.date } });
    if (result.code === "OK" && result.bookingPolicy !== BOOKING_PUBLICATION_POLICY) {
      return NextResponse.json({ message: "現在、予約受付を調整しています。管理者にお問い合わせください。" }, { status: 503, headers });
    }
    if (result.code !== "OK") throw new Error("Availability unavailable");
    const availability = calculateDayAvailability(query, result.busy, new Date());
    return NextResponse.json({ ok: true, availability }, { headers });
  } catch (error) {
    if (error instanceof BookingValidationError) return NextResponse.json({ message: error.message }, { status: 400, headers });
    return NextResponse.json({ message: "空き状況を取得できませんでした。再読み込みしてお試しください。" }, { status: 503, headers });
  }
}
