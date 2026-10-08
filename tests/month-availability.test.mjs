import test from "node:test";
import assert from "node:assert/strict";
import { calculateDayAvailability, calculateMonthAvailability, shiftBookingMonth, validateMonthAvailabilityQuery } from "../lib/booking.ts";
import { apiHarness } from "./helpers/api-harness.mjs";

const now = new Date("2026-10-05T00:00:00Z");
const query = { resource: "studio", month: "2026-10" };
const policy = { code: "OK", bookingPolicy: "public-opaque-v2" };
const busy = [{ start: "2026-10-06T12:00:00+09:00", end: "2026-10-06T14:00:00+09:00" }];
const day = (result, date) => result.days.find(item => item.date === date);
function handler(options = {}) {
  const h = apiHarness("monthAvailability", { backendResult: { ...policy, busy: [] }, ...options });
  return { ...h, send: (input = query) => h.invoke(new Request(`https://studio.example/api/availability/month?${new URLSearchParams(input)}`)) };
}

test("月の日付一覧は月末・うるう年・年の境界を扱う", () => {
  assert.equal(validateMonthAvailabilityQuery(query, now).dates.length, 31);
  assert.equal(validateMonthAvailabilityQuery({ ...query, month: "2026-11" }, now).dates.length, 30);
  assert.equal(validateMonthAvailabilityQuery({ ...query, month: "2028-02" }, now).dates.at(-1), "2028-02-29");
  assert.equal(shiftBookingMonth("2026-12", 1), "2027-01");
  assert.equal(shiftBookingMonth("2027-01", -1), "2026-12");
});

test("月の受付範囲は日本時間を使う", () => {
  assert.throws(() => validateMonthAvailabilityQuery({ ...query, month: "2026-09" }, new Date("2026-09-30T15:00:00Z")));
  assert.equal(validateMonthAvailabilityQuery(query, new Date("2026-09-30T15:00:00Z")).month, "2026-10");
});

test("過去日は空きとして返さず、各日の計算は日単位の空き表示と一致する", () => {
  const result = calculateMonthAvailability(query, busy, now);
  assert.deepEqual(day(result, "2026-10-04"), { date: "2026-10-04", status: "past" });
  assert.deepEqual(day(result, "2026-10-06").availability, calculateDayAvailability({ resource: "studio", date: "2026-10-06" }, busy, now));
  assert.deepEqual(day(result, "2026-10-07").availability.available, [{ startTime: "10:00", endTime: "20:00" }]);
});

test("終日と日をまたぐ予約を月の各日に切り分ける", () => {
  const periods = [{ start: "2026-10-06T19:00:00+09:00", end: "2026-10-08T11:00:00+09:00" }];
  const result = calculateMonthAvailability(query, periods, now);
  assert.deepEqual(day(result, "2026-10-06").availability.available, [{ startTime: "10:00", endTime: "19:00" }]);
  assert.deepEqual(day(result, "2026-10-07").availability.available, []);
  assert.deepEqual(day(result, "2026-10-08").availability.available, [{ startTime: "11:00", endTime: "20:00" }]);
});

test("野田は閉館日を含めて表示し、閉館後は受付終了とする", () => {
  const result = calculateMonthAvailability({ resource: "noda", month: "2026-12" }, [], now);
  assert.equal(day(result, "2026-12-28").status, "open");
  for (const date of ["2026-12-29", "2026-12-30", "2026-12-31"]) assert.deepEqual(day(result, date), { date, status: "closed" });
});

test("不完全な予定を月全体の空きとみなさない", () => {
  for (const periods of [null, [null], [{ start: "invalid", end: "invalid" }], [{ ...busy[0], end: busy[0].start }]]) {
    assert.throws(() => calculateMonthAvailability(query, periods, now));
  }
});

test("月APIは不正な入力をGoogleへ送らない", async () => {
  for (const input of [{}, { ...query, resource: "other" }, { ...query, month: "2026-09" }, { ...query, month: "2026-13" }, { ...query, month: "2026-1" }, { ...query, month: "9999-12" }]) {
    const h = handler();
    assert.equal((await h.send(input)).status, 400);
    assert.equal(h.calls.length, 0);
  }
});

test("月対応のGoogleコードへ一度の照会を送り、予定の個人情報を返さない", async () => {
  const h = handler({ capabilityResult: { ...policy, monthlyAvailability: true }, backendResult: { ...policy, month: query.month, busy, email: "private@example.com", summary: "private title" } });
  const response = await h.send();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.deepEqual(day(result.availability, "2026-10-06").availability.busy, [{ startTime: "12:00", endTime: "14:00" }]);
  assert.equal(JSON.stringify(result).includes("private"), false);
  assert.equal(h.calls.length, 2);
  assert.deepEqual(JSON.parse(h.calls[1].options.body), { action: "monthAvailability", availability: query, secret: "test-backend-secret" });
  assert.ok(h.calls.every(call => call.options.signal === h.calls[0].options.signal));
});

test("公開確認対応済みの日単位Googleコードでも、最大6照会で月を取得する", async () => {
  let active = 0, maximum = 0;
  const h = handler({ backendResult: async (payload) => {
    active++; maximum = Math.max(maximum, active);
    await new Promise(resolve => setImmediate(resolve));
    active--;
    return { ...policy, busy: payload.availability.date === "2026-10-06" ? busy : [] };
  } });
  const result = await (await h.send()).json();
  assert.equal(result.ok, true);
  assert.equal(maximum, 6);
  const dates = h.calls.slice(1).map(call => JSON.parse(call.options.body).availability.date).sort();
  assert.equal(dates.length, 27);
  assert.equal(new Set(dates).size, 27);
  assert.equal(dates[0], "2026-10-05");
  assert.equal(dates.at(-1), "2026-10-31");
  assert.deepEqual(day(result.availability, "2026-10-06").availability.busy, [{ startTime: "12:00", endTime: "14:00" }]);
});

test("野田の互換照会は閉館日までで、閉館後の月はGoogleを照会しない", async () => {
  const h = handler();
  assert.equal((await h.send({ resource: "noda", month: "2026-12" })).status, 200);
  assert.equal(h.calls.length, 29);
  assert.equal(JSON.parse(h.calls.at(-1).options.body).availability.date, "2026-12-28");
  const closed = handler();
  const result = await (await closed.send({ resource: "noda", month: "2027-01" })).json();
  assert.ok(result.availability.days.every(item => item.status === "closed"));
  assert.equal(closed.calls.length, 0);
});

test("公開確認に未対応のGoogleコードで月を空きと表示しない", async () => {
  const h = handler({ capabilityResult: { code: "OK" } });
  assert.equal((await h.send()).status, 503);
  assert.equal(h.calls.length, 1);
});

test("途中の日が取得できない月は、部分的な空き結果を返さず照会を中断する", async () => {
  const h = handler({ backendResult: payload => payload.availability.date === "2026-10-06" ? { code: "UNAVAILABLE" } : { ...policy, busy: [] } });
  const response = await h.send();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, undefined);
  assert.equal(h.calls[0].options.signal.aborted, true);
});

test("月照会の応答の月違い・不完全・旧公開ポリシーを成功としない", async () => {
  for (const backendResult of [{ ...policy, month: "2026-11", busy: [] }, { ...policy, month: query.month }, { code: "OK", month: query.month, busy: [] }, { ...policy, month: query.month, busy: [null] }]) {
    const response = await handler({ capabilityResult: { ...policy, monthlyAvailability: true }, backendResult }).send();
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, undefined);
  }
});

test("月APIは接続未設定・通信失敗・HTTPエラーで空きを返さない", async () => {
  for (const options of [{ env: { GOOGLE_BOOKING_SECRET: "" } }, { failure: true }, { upstreamStatus: 500 }]) {
    const response = await handler(options).send();
    assert.equal(response.status, 503);
    assert.equal(JSON.stringify(await response.json()).includes("upstream token"), false);
  }
});
