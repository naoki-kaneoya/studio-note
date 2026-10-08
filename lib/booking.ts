export type BookingInput = {
  resource: "studio" | "noda";
  name: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  requestId: string;
};

export type ValidatedBooking = BookingInput & {
  startAt: string;
  endAt: string;
};

export const NODA_LAST_BOOKING_DATE = "2026-12-28";
export const BOOKING_RESOURCES = [
  { id: "studio", name: "Studio note（庄内）" },
  { id: "noda", name: "野田小学校スタジオ" },
] as const;

export class BookingValidationError extends Error {}

export type TimeRange = { startTime: string; endTime: string };
export type DayAvailability = {
  resource: BookingInput["resource"];
  date: string;
  available: TimeRange[];
  busy: TimeRange[];
  checkedAt: string;
};

export type MonthAvailability = {
  resource: BookingInput["resource"];
  month: string;
  days: Array<
    { date: string; status: "past" | "closed" } |
    { date: string; status: "open"; availability: DayAvailability }
  >;
  checkedAt: string;
};

export function shiftBookingMonth(month: string, offset: number): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

export function validateMonthAvailabilityQuery(input: unknown, now = new Date()): {
  resource: BookingInput["resource"]; month: string; dates: string[];
} {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new BookingValidationError("施設と表示する月を選んでください。");
  const value = input as Record<string, unknown>;
  const resource = typeof value.resource === "string" ? value.resource.trim() : "";
  const month = typeof value.month === "string" ? value.month.trim() : "";
  if (resource !== "studio" && resource !== "noda") throw new BookingValidationError("予約する施設を選んでください。");
  const start = new Date(`${month}-01T00:00:00Z`);
  if (!/^\d{4}-\d{2}$/.test(month) || Number.isNaN(start.getTime()) || start.toISOString().slice(0, 7) !== month || month === "9999-12") {
    throw new BookingValidationError("表示する月を確認してください。");
  }
  if (month < todayInJapan(now).slice(0, 7)) throw new BookingValidationError("今月以降を選んでください。");
  const dates: string[] = [];
  for (let date = start; date.toISOString().slice(0, 7) === month; date = new Date(date.getTime() + 86400000)) {
    dates.push(date.toISOString().slice(0, 10));
  }
  return { resource, month, dates };
}

/** 月全体の予定を各日の営業時間へ切り分ける。過去日・閉館後は予約可能としない。 */
export function calculateMonthAvailability(input: unknown, periods: unknown, now = new Date()): MonthAvailability {
  const query = validateMonthAvailabilityQuery(input, now);
  const today = todayInJapan(now);
  const days: MonthAvailability["days"] = query.dates.map((date) => {
    if (date < today) return { date, status: "past" };
    if (query.resource === "noda" && date > NODA_LAST_BOOKING_DATE) return { date, status: "closed" };
    return { date, status: "open", availability: calculateDayAvailability({ resource: query.resource, date }, periods, now) };
  });
  return { resource: query.resource, month: query.month, days, checkedAt: now.toISOString() };
}

export function validateAvailabilityQuery(input: unknown, now = new Date()): { resource: BookingInput["resource"]; date: string; dayStart: string; dayEnd: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new BookingValidationError("施設と利用日を選んでください。");
  }
  const value = input as Record<string, unknown>;
  const resource = typeof value.resource === "string" ? value.resource.trim() : "";
  const date = typeof value.date === "string" ? value.date.trim() : "";
  if (resource !== "studio" && resource !== "noda") throw new BookingValidationError("予約する施設を選んでください。");
  const calendarDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== date) {
    throw new BookingValidationError("利用日を確認してください。");
  }
  if (date < todayInJapan(now)) throw new BookingValidationError("今日以降の日付を選んでください。");
  if (resource === "noda" && date > NODA_LAST_BOOKING_DATE) throw new BookingValidationError("野田小学校の予約は閉館日まで受け付けています。");
  const nextDate = new Date(calendarDate.getTime() + 86400000).toISOString().slice(0, 10);
  return { resource, date, dayStart: `${date}T00:00:00+09:00`, dayEnd: `${nextDate}T00:00:00+09:00` };
}

/** 各カレンダーの予定をまとめ、予約できる連続した時間帯だけを返す。 */
export function calculateDayAvailability(input: unknown, periods: unknown, now = new Date()): DayAvailability {
  const query = validateAvailabilityQuery(input, now);
  if (!Array.isArray(periods)) throw new Error("Missing availability periods");
  const midnight = Date.parse(query.dayStart);
  const opens = query.resource === "studio" ? 600 : 0;
  const closes = query.resource === "studio" ? 1200 : 1439;
  const occupied: Array<[number, number]> = [];
  for (const period of periods) {
    if (!period || typeof period.start !== "string" || typeof period.end !== "string") throw new Error("Invalid busy period");
    const from = Date.parse(period.start), to = Date.parse(period.end);
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) throw new Error("Invalid busy period");
    // 分単位での予約が秒単位の予定に重ならないよう、安全側に丸める。
    const start = Math.max(opens, Math.floor((from - midnight) / 60000));
    const end = Math.min(closes, Math.ceil((to - midnight) / 60000));
    if (end > start) occupied.push([start, end]);
  }
  occupied.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const interval of occupied) {
    const previous = merged.at(-1);
    if (previous && interval[0] <= previous[1]) previous[1] = Math.max(previous[1], interval[1]);
    else merged.push([...interval]);
  }
  const clock = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
  const asRange = ([start, end]: [number, number]) => ({ startTime: clock(start), endTime: clock(end) });
  const available: Array<[number, number]> = [];
  let cursor = Math.max(opens, Math.floor((now.getTime() - midnight) / 60000) + 1);
  for (const [start, end] of merged) {
    if (start > cursor && cursor < closes) available.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < closes) available.push([cursor, closes]);
  return { resource: query.resource, date: query.date, available: available.map(asRange), busy: merged.map(asRange), checkedAt: now.toISOString() };
}

export function isRangeAvailable(availability: DayAvailability | null, startTime: string, endTime: string): boolean {
  return Boolean(availability && startTime && endTime && startTime < endTime &&
    availability.available.some((range) => startTime >= range.startTime && endTime <= range.endTime));
}

/** 入力時刻は端末のタイムゾーンに関係なく日本時間で解釈する。 */
export function validateBooking(
  input: unknown,
  now: Date = new Date()
): ValidatedBooking {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new BookingValidationError("予約内容を確認してください。");
  }
  const data = input as Record<string, unknown>;
  const text = (key: string) =>
    typeof data[key] === "string" ? data[key].trim() : "";
  const name = text("name");
  const email = text("email");
  const date = text("date");
  const startTime = text("startTime");
  const endTime = text("endTime");
  const requestId = text("requestId");
  const resource = text("resource");

  if (resource !== "studio" && resource !== "noda") {
    throw new BookingValidationError("予約する施設を選んでください。");
  }

  if (!name || name.length > 80 || /[\r\n\x00-\x1f]/.test(name)) {
    throw new BookingValidationError("お名前を80文字以内で入力してください。");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BookingValidationError("メールアドレスを確認してください。");
  }
  const calendarDate = new Date(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== date
  ) {
    throw new BookingValidationError("利用日を確認してください。");
  }
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
    throw new BookingValidationError("開始時間と終了時間を入力してください。");
  }
  if (endTime <= startTime) {
    throw new BookingValidationError("終了時間は、同じ日の開始時間より後にしてください。");
  }
  if (resource === "studio" && (startTime < "10:00" || endTime > "20:00")) {
    throw new BookingValidationError("Studio note（庄内）は10:00〜20:00の時間内で予約してください。");
  }
  const startAt = `${date}T${startTime}:00+09:00`;
  const endAt = `${date}T${endTime}:00+09:00`;
  if (new Date(startAt).getTime() <= now.getTime()) {
    throw new BookingValidationError("これから利用する日時を選んでください。");
  }
  if (resource === "noda" && date > NODA_LAST_BOOKING_DATE) {
    throw new BookingValidationError("野田小学校の予約は閉館日まで受け付けています。");
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new BookingValidationError("ページを開き直して、もう一度お試しください。");
  }
  return { resource, name, email, date, startTime, endTime, requestId, startAt, endAt };
}

export function todayInJapan(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
