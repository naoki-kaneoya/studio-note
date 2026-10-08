import test from "node:test";
import assert from "node:assert/strict";
import { validateBooking, todayInJapan, BookingValidationError } from "../lib/booking.ts";

const now = new Date("2026-10-05T00:00:00Z");
const booking = {
  resource: "noda",
  name: "山田 太郎", email: "member@example.com", date: "2026-10-06",
  startTime: "10:00", endTime: "12:00", requestId: "12345678-1234-4234-8234-123456789abc",
};

test("日本時間として解釈し、入力の余白を除く", () => {
  const result = validateBooking({ ...booking, name: " 山田 太郎 " }, now);
  assert.equal(result.name, booking.name);
  assert.equal(result.startAt, "2026-10-06T10:00:00+09:00");
  assert.equal(new Date(result.startAt).toISOString(), "2026-10-06T01:00:00.000Z");
});

for (const [name, patch] of [
  ["存在しない日付", { date: "2026-02-30" }],
  ["不正な日付形式", { date: "2026-10-6" }],
  ["過去の開始日時", { date: "2026-10-05", startTime: "08:00" }],
  ["同じ開始と終了", { endTime: "10:00" }],
  ["日をまたぐ時間", { startTime: "23:00", endTime: "01:00" }],
  ["24時表記", { endTime: "24:00" }],
  ["閉館後の日付", { date: "2026-12-29" }],
  ["空の名前", { name: " " }],
  ["長すぎる名前", { name: "あ".repeat(81) }],
  ["改行を含む名前", { name: "予約\n別の予定" }],
  ["不正なメール", { email: "not-an-email" }],
  ["再送IDの不正", { requestId: "not-a-uuid" }],
  ["文字列でない入力", { startTime: ["10:00"] }],
  ["未知の施設", { resource: "other" }],
  ["施設未選択", { resource: "" }],
  ["庄内の営業時間前", { resource: "studio", startTime: "09:00" }],
  ["庄内の営業時間後", { resource: "studio", endTime: "21:00" }],
]) {
  test(name + "は受け付けない", () => {
    assert.throws(() => validateBooking({ ...booking, ...patch }, now), BookingValidationError);
  });
}

test("閉館日の予約は可能", () => {
  assert.equal(validateBooking({ ...booking, date: "2026-12-28" }, now).date, "2026-12-28");
});

test("庄内は野田小学校の閉館後も予約できる", () => {
  assert.equal(validateBooking({ ...booking, resource: "studio", date: "2027-01-05" }, now).resource, "studio");
});

test("サーバーがUTCでも日本の日付を使う", () => {
  assert.equal(todayInJapan(new Date("2026-10-05T15:01:00Z")), "2026-10-06");
});
