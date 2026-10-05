import test from "node:test";
import assert from "node:assert/strict";
import { calculateDayAvailability, isRangeAvailable, validateAvailabilityQuery } from "../lib/booking.ts";
import { apiHarness } from "./helpers/api-harness.mjs";

const now = new Date("2026-10-05T00:00:00Z");
const studio = { resource: "studio", date: "2026-10-06" };
const period = (start, end) => ({ start: `2026-10-06T${start}:00+09:00`, end: `2026-10-06T${end}:00+09:00` });
const range = (startTime, endTime) => ({ startTime, endTime });

test("庄内の空き枠は営業時間内で表示する", () => {
  assert.deepEqual(calculateDayAvailability(studio, [], now).available, [range("10:00", "20:00")]);
});

test("既存予定の前後を予約できる時間帯として表示する", () => {
  const result = calculateDayAvailability(studio, [period("12:00", "14:00")], now);
  assert.deepEqual(result.available, [range("10:00", "12:00"), range("14:00", "20:00")]);
  assert.deepEqual(result.busy, [range("12:00", "14:00")]);
});

test("複数カレンダーの重複・隣接・内包した予定を一つにまとめる", () => {
  const result = calculateDayAvailability(studio, [period("14:00", "15:00"), period("11:00", "13:00"), period("12:00", "14:00"), period("12:10", "12:20")], now);
  assert.deepEqual(result.available, [range("10:00", "11:00"), range("15:00", "20:00")]);
  assert.deepEqual(result.busy, [range("11:00", "15:00")]);
});

test("終日の予定がある場合は空き枠を表示しない", () => {
  const result = calculateDayAvailability(studio, [{ start: "2026-10-05T15:00:00Z", end: "2026-10-06T15:00:00Z" }], now);
  assert.deepEqual(result.available, []);
  assert.deepEqual(result.busy, [range("10:00", "20:00")]);
});

test("日をまたぐ予定は選択日の営業時間に切り詰める", () => {
  const result = calculateDayAvailability(studio, [
    { start: "2026-10-05T22:00:00+09:00", end: "2026-10-06T11:00:00+09:00" },
    { start: "2026-10-06T19:00:00+09:00", end: "2026-10-07T02:00:00+09:00" },
  ], now);
  assert.deepEqual(result.available, [range("11:00", "19:00")]);
});

test("秒単位の既存予定に分単位の予約が重ならない", () => {
  const result = calculateDayAvailability(studio, [{ start: "2026-10-06T12:00:59+09:00", end: "2026-10-06T13:00:01+09:00" }], now);
  assert.deepEqual(result.available, [range("10:00", "12:00"), range("13:01", "20:00")]);
});

test("当日は過去と現在の開始時刻を空き枠から除外する", () => {
  const result = calculateDayAvailability({ ...studio, date: "2026-10-05" }, [], new Date("2026-10-05T03:30:00Z"));
  assert.deepEqual(result.available, [range("12:31", "20:00")]);
});

test("営業終了後の当日は予約できる時間がない", () => {
  assert.deepEqual(calculateDayAvailability({ ...studio, date: "2026-10-05" }, [], new Date("2026-10-05T11:00:00Z")).available, []);
});

test("野田は同日内の00:00〜23:59で予約可能な時間を返す", () => {
  assert.deepEqual(calculateDayAvailability({ resource: "noda", date: studio.date }, [], now).available, [range("00:00", "23:59")]);
});

test("営業時間外だけの予定は営業時間内の空き枠を消費しない", () => {
  assert.deepEqual(calculateDayAvailability(studio, [period("08:00", "09:00"), period("21:00", "22:00")], now).available, [range("10:00", "20:00")]);
});

test("連続した空き枠に全体が収まる時間だけ選択できる", () => {
  const result = calculateDayAvailability(studio, [period("12:00", "14:00")], now);
  assert.equal(isRangeAvailable(result, "11:00", "12:00"), true);
  for (const [start, end] of [["11:00", "15:00"], ["13:00", "14:30"], ["09:00", "11:00"], ["14:00", "14:00"], ["", ""]]) {
    assert.equal(isRangeAvailable(result, start, end), false);
  }
  assert.equal(isRangeAvailable(null, "10:00", "12:00"), false);
});

for (const [label, query] of [
  ["不明な施設", { ...studio, resource: "other" }],
  ["存在しない日付", { ...studio, date: "2026-02-30" }],
  ["過去の日付", { ...studio, date: "2026-10-04" }],
  ["閉館後の野田", { resource: "noda", date: "2026-12-29" }],
]) {
  test(label + "の空き状況を取得しない", () => assert.throws(() => validateAvailabilityQuery(query, now)));
}

test("閉館日の野田と閉館後の日付の庄内は確認できる", () => {
  assert.equal(validateAvailabilityQuery({ resource: "noda", date: "2026-12-28" }, now).date, "2026-12-28");
  assert.equal(validateAvailabilityQuery({ ...studio, date: "2027-01-01" }, now).dayEnd, "2027-01-02T00:00:00+09:00");
});

for (const periods of [undefined, [{ start: "invalid", end: "invalid" }], [period("12:00", "11:00")], [null]]) {
  test("不完全な予定を空きとみなさない: " + JSON.stringify(periods), () => assert.throws(() => calculateDayAvailability(studio, periods, now)));
}

function handler(options = {}) {
  const { invoke, calls } = apiHarness("availability", options);
  return { calls, send: (query = studio) => invoke(new Request(`https://studio.example/api/availability?${new URLSearchParams(query)}`)) };
}

test("空きAPIは選択施設と利用日を転送し、時間帯だけを返す", async () => {
  const h = handler({ backendResult: { code: "OK", busy: [period("12:00", "14:00")], secret: "must-not-leak", email: "private@example.com" } });
  const response = await h.send();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const result = await response.json();
  assert.deepEqual(result.availability.available, [range("10:00", "12:00"), range("14:00", "20:00")]);
  assert.equal(JSON.stringify(result).includes("private@example.com"), false);
  assert.equal(JSON.stringify(result).includes("must-not-leak"), false);
  assert.deepEqual(JSON.parse(h.calls[0].options.body), { action: "availability", availability: studio, secret: "test-backend-secret" });
  assert.equal(h.calls[0].options.cache, "no-store");
});

test("Google接続未設定では空きAPIは準備中になる", async () => {
  const h = handler({ env: { GOOGLE_BOOKING_SECRET: "" } });
  assert.equal((await h.send()).status, 503);
  assert.equal(h.calls.length, 0);
});

test("空きAPIも不正なGoogle転送URLを使用しない", async () => {
  const h = handler({ env: { GOOGLE_BOOKING_SCRIPT_URL: "https://other.example/exec" } });
  assert.equal((await h.send()).status, 503);
  assert.equal(h.calls.length, 0);
});

test("空きAPIは不正な施設・日付をGoogleへ転送しない", async () => {
  for (const query of [{}, { ...studio, resource: "other" }, { ...studio, date: "2026-02-30" }, { resource: "noda", date: "2026-12-29" }]) {
    const h = handler();
    assert.equal((await h.send(query)).status, 400);
    assert.equal(h.calls.length, 0);
  }
});

for (const backendResult of [{ code: "UNAVAILABLE" }, { code: "OK" }, { code: "OK", busy: [null] }, []]) {
  test("空きAPIは取得失敗・不完全な結果を空きとしない: " + JSON.stringify(backendResult), async () => {
    const response = await handler({ backendResult }).send();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal((await response.json()).ok, undefined);
  });
}

test("空きAPIは通信障害の詳細・秘密値を公開しない", async () => {
  const response = await handler({ failure: true }).send();
  assert.equal(response.status, 503);
  assert.equal(JSON.stringify(await response.json()).includes("upstream token"), false);
});

test("GoogleのHTTPエラーを成功としない", async () => {
  const response = await handler({ upstreamStatus: 500, backendResult: { code: "OK", busy: [] } }).send();
  assert.equal(response.status, 503);
});
