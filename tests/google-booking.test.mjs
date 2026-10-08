import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";
import { validateBooking } from "../lib/booking.ts";

const source = readFileSync(new URL("../google-apps-script/Code.gs", import.meta.url), "utf8");
const now = new Date("2026-10-05T00:00:00Z");
const input = {
  resource: "noda",
  name: "山田 太郎", email: "member@example.com", date: "2026-10-06",
  startTime: "10:00", endTime: "12:00", requestId: "12345678-1234-4234-8234-123456789abc",
};

function harness({ calendars, properties, lockAvailable = true, failInsert = false, afterInsert, failList = false, failPatch = false, listPageSize = 250 } = {}) {
  const calls = [];
  const events = new Map();
  const logs = [];
  const config = { BOOKING_BACKEND_SECRET: "test-backend-secret", BOOKING_CALENDARS: '{"studio":"studio@example.com","noda":"noda@example.com"}', ...properties };
  const state = { locked: false, releases: 0, insertions: 0, updates: 0 };
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
  }
  const context = vm.createContext({
    Date: FixedDate,
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key) => config[key] || null }) },
    LockService: { getScriptLock: () => ({
      tryLock: () => { state.locked = lockAvailable; return lockAvailable; },
      releaseLock: () => { assert.equal(state.locked, true); state.locked = false; state.releases++; },
    }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: "sha256" }, Charset: { UTF_8: "utf8" },
      computeDigest: (_, value) => [...createHash("sha256").update(value).digest()],
    },
    ContentService: { MimeType: { JSON: "application/json" }, createTextOutput: (text) => ({ text, setMimeType() { return this; } }) },
    ScriptApp: { getOAuthToken: () => "test-token" },
    Logger: { log: (message) => logs.push(message) },
    UrlFetchApp: { fetch: (url, options) => {
      if (!url.endsWith("/freeBusy")) assert.equal(state.locked, true, "予約の読み取り・登録は共有ロックの内側で行う");
      assert.equal(options.headers.Authorization, "Bearer test-token");
      assert.equal(options.followRedirects, false);
      const body = options.payload ? JSON.parse(options.payload) : undefined;
      calls.push({ url, options, body, locked: state.locked });
      let status = 200, result;
      if (url.endsWith("/freeBusy")) {
        result = { calendars: calendars || Object.fromEntries(body.items.map(({ id }) => [id, {
          busy: [...events].filter(([key, event]) => key.includes("/calendars/" + encodeURIComponent(id) + "/events/") && event.status !== "cancelled")
            .map(([, event]) => ({ start: event.start.dateTime, end: event.end.dateTime })),
        }])) };
      } else if (options.method === "get" && new URL(url).pathname.endsWith("/events")) {
        if (failList) { status = 403; result = { error: { code: 403 } }; }
        else {
          const parsed = new URL(url);
          const eventBase = parsed.origin + parsed.pathname + "/";
          const from = Date.parse(parsed.searchParams.get("timeMin"));
          const matching = [...events].filter(([key, event]) => key.startsWith(eventBase) && Date.parse(event.end.dateTime) > from).map(([, event]) => event);
          const offset = Number(parsed.searchParams.get("pageToken") || 0);
          result = matching.length ? { items: matching.slice(offset, offset + listPageSize) } : {};
          if (offset + listPageSize < matching.length) result.nextPageToken = String(offset + listPageSize);
        }
      } else if (options.method === "patch") {
        if (failPatch) { status = 403; result = { error: { code: 403 } }; }
        else {
          const key = url.split("?")[0];
          const previous = events.get(key);
          if (!previous) { status = 404; result = {}; }
          else { result = { ...previous, ...body }; events.set(key, result); state.updates++; }
        }
      } else if (options.method === "get") {
        result = events.get(url.split("/events/")[0] + "/events/" + url.split("/").at(-1));
        if (!result) { status = 404; result = { error: { code: 404 } }; }
      } else {
        if (failInsert) throw new Error("Google unavailable");
        const eventKey = url.split("/events?")[0] + "/events/" + body.id;
        if (events.has(eventKey)) { status = 409; result = { error: { code: 409 } }; }
        else {
          state.insertions++;
          result = { ...body, status: "confirmed" };
          events.set(eventKey, result);
          afterInsert?.(result);
        }
      }
      return { getResponseCode: () => status, getContentText: () => JSON.stringify(result) };
    } },
  });
  vm.runInContext(source, context);
  const submit = (booking = input, secret = config.BOOKING_BACKEND_SECRET) => {
    const result = context.doPost({ postData: { contents: JSON.stringify({ secret, booking }) } });
    return JSON.parse(result.text).code;
  };
  const availability = (query = { resource: "noda", date: input.date }, secret = config.BOOKING_BACKEND_SECRET) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify({ secret, action: "availability", availability: query }) } }).text);
  return { context, submit, availability, calls, events, state, logs };
}

test("空きがあれば日本時間で登録し、入力メールを招待する", () => {
  const h = harness();
  assert.equal(h.submit(), "OK");
  const insertion = h.calls.find((call) => call.url.endsWith("/events?sendUpdates=all"));
  assert.equal(insertion.body.attendees[0].email, input.email);
  assert.equal(insertion.body.start.dateTime, "2026-10-06T10:00:00+09:00");
  assert.equal(insertion.body.transparency, "opaque");
  assert.equal(insertion.body.visibility, "public", "外部の予約サービスが読める公開予定として登録する");
  assert.equal(h.state.insertions, 1);
  assert.equal(h.state.releases, 1);
  assert.ok(h.calls.every((call) => call.locked), "予約の空き確認も共有ロックの内側で行う");
});

test("庄内を選ぶと庄内の共通カレンダーにだけ照合・登録する", () => {
  const h = harness();
  assert.equal(h.submit({ ...input, resource: "studio" }), "OK");
  const availability = h.calls.find((call) => call.url.endsWith("/freeBusy"));
  assert.deepEqual(availability.body.items, [{ id: "studio@example.com" }]);
  const insertion = h.calls.find((call) => call.url.endsWith("/events?sendUpdates=all"));
  assert.match(insertion.url, /studio%40example\.com/);
  assert.equal(insertion.body.extendedProperties.private.studioNoteResource, "studio");
  assert.equal(insertion.body.visibility, "public");
});

test("既存の今後のアプリ予約だけを公開へ変更し、日時・招待者を保持する", () => {
  const h = harness();
  h.submit();
  h.submit({ ...input, resource: "studio" });
  for (const event of h.events.values()) event.visibility = "private";
  const original = structuredClone([...h.events]);
  const base = "https://www.googleapis.com/calendar/v3/calendars/noda%40example.com/events/";
  const sample = [...h.events.values()][0];
  h.events.set(base + "external-event", { ...sample, id: "external-event", visibility: "private" });
  const pastId = "stnote" + "a".repeat(64);
  h.events.set(base + pastId, { ...sample, id: pastId, visibility: "private", start: { dateTime: "2026-10-04T10:00:00+09:00" }, end: { dateTime: "2026-10-04T12:00:00+09:00" } });
  const unmarkedId = "stnote" + "b".repeat(64);
  h.events.set(base + unmarkedId, { ...sample, id: unmarkedId, visibility: "private", extendedProperties: { private: { studioNoteResource: "noda" } } });
  const cancelledId = "stnote" + "c".repeat(64);
  h.events.set(base + cancelledId, { ...sample, id: cancelledId, visibility: "private", status: "cancelled" });
  assert.equal(h.context.publishExistingBookings(), 2);
  for (const [key, before] of original) assert.deepEqual(h.events.get(key), { ...before, visibility: "public" });
  for (const id of ["external-event", pastId, unmarkedId, cancelledId]) assert.equal(h.events.get(base + id).visibility, "private");
  assert.equal(h.state.insertions, 2, "予定や招待を新規作成しない");
  const patches = h.calls.filter((call) => call.options.method === "patch");
  assert.equal(patches.length, 2);
  for (const patch of patches) {
    assert.deepEqual(patch.body, { visibility: "public" });
    assert.match(patch.url, /sendUpdates=none$/);
  }
  assert.ok(h.logs.every((message) => !message.includes(input.name) && !message.includes(input.email)));
  assert.equal(h.context.publishExistingBookings(), 0, "公開済みの予約は再更新しない");
  assert.equal(h.state.updates, 2);
});

test("既存予約の公開変更は一覧の次ページも処理する", () => {
  const h = harness({ listPageSize: 1 });
  h.submit();
  h.submit({ ...input, date: "2026-10-07", requestId: "aaaaaaaa-1234-4234-8234-123456789abc" });
  for (const event of h.events.values()) event.visibility = "private";
  assert.equal(h.context.publishExistingBookings(), 2);
  assert.ok([...h.events.values()].every((event) => event.visibility === "public"));
  assert.ok(h.calls.some((call) => call.url.includes("pageToken=1")));
});

for (const [label, flags] of [["一覧の取得に失敗", { failList: true }], ["公開変更に失敗", { failPatch: true }]]) {
  test(label + "したら完了とせず、ロックを解放する", () => {
    const h = harness(flags);
    h.submit();
    [...h.events.values()][0].visibility = "private";
    const releasedBefore = h.state.releases;
    assert.throws(() => h.context.publishExistingBookings(), /取得できません|更新に失敗/);
    assert.equal(h.state.releases, releasedBefore + 1);
    assert.equal(h.state.locked, false);
    assert.equal([...h.events.values()][0].visibility, "private");
  });
}

test("予約処理中は既存予約の公開変更を開始しない", () => {
  const h = harness({ lockAvailable: false });
  assert.throws(() => h.context.publishExistingBookings(), /予約処理中/);
  assert.equal(h.calls.length, 0);
  assert.equal(h.state.releases, 0);
});

test("別施設なら同じ時間に予約でき、同じ施設の重複は拒否する", () => {
  const h = harness();
  assert.equal(h.submit(), "OK");
  assert.equal(h.submit({ ...input, resource: "studio" }), "OK");
  assert.equal(h.state.insertions, 2);
  assert.equal(h.submit({ ...input, requestId: "aaaaaaaa-1234-4234-8234-123456789abc" }), "CONFLICT");
  assert.equal(h.state.insertions, 2);
});

test("追加の照合カレンダーも施設ごとに分ける", () => {
  const h = harness({ properties: { CONFLICT_CALENDAR_IDS: '{"noda":["noda-external@example.com"],"studio":["studio-external@example.com"]}' } });
  assert.equal(h.submit(), "OK");
  const availability = h.calls.find((call) => call.url.endsWith("/freeBusy"));
  assert.deepEqual(availability.body.items.map((item) => item.id), ["noda@example.com", "noda-external@example.com"]);
});

for (const [label, value] of [["同じカレンダーを両施設に指定", '{"noda":"same@example.com","studio":"same@example.com"}'], ["片方のカレンダーが未設定", '{"noda":"noda@example.com"}']]) {
  test(label + "の場合は設定未完了とする", () => {
    const h = harness({ properties: { BOOKING_CALENDARS: value } });
    assert.equal(h.submit(), "UNAVAILABLE");
    assert.equal(h.calls.length, 0);
  });
}

for (const [label, period] of [
  ["一部重複", { start: "2026-10-06T11:00:00+09:00", end: "2026-10-06T13:00:00+09:00" }],
  ["内包", { start: "2026-10-06T10:30:00+09:00", end: "2026-10-06T11:00:00+09:00" }],
  ["終日予定", { start: "2026-10-06T00:00:00+09:00", end: "2026-10-07T00:00:00+09:00" }],
]) {
  test(label + "の既存予約があれば登録しない", () => {
    const h = harness({ calendars: { "noda@example.com": { busy: [period] } } });
    assert.equal(h.submit(), "CONFLICT");
    assert.equal(h.state.insertions, 0);
  });
}

test("前後がぴったり隣接する予約は受け付ける", () => {
  const h = harness({ calendars: { "noda@example.com": { busy: [
    { start: "2026-10-06T09:00:00+09:00", end: "2026-10-06T10:00:00+09:00" },
    { start: "2026-10-06T12:00:00+09:00", end: "2026-10-06T13:00:00+09:00" },
  ] } } });
  assert.equal(h.submit(), "OK");
});

test("外部予約用の別カレンダーも重複確認する", () => {
  const h = harness({
    properties: { CONFLICT_CALENDAR_IDS: '{"noda":["external@example.com"]}' },
    calendars: {
      "noda@example.com": { busy: [] },
      "external@example.com": { busy: [{ start: "2026-10-06T01:00:00Z", end: "2026-10-06T03:00:00Z" }] },
    },
  });
  assert.equal(h.submit(), "CONFLICT");
  assert.equal(h.state.insertions, 0);
});

for (const [label, calendars] of [
  ["閲覧権限がない", { "noda@example.com": { errors: [{ reason: "notFound" }] } }],
  ["結果が欠落する", {}],
  ["空き時間の形式が不正", { "noda@example.com": { busy: [{ start: "invalid", end: "invalid" }] } }],
]) {
  test(label + "場合は空きとみなさない", () => {
    const h = harness({ calendars });
    assert.equal(h.submit(), "UNAVAILABLE");
    assert.equal(h.state.insertions, 0);
  });
}

test("同時処理中は予約を登録せず、再送を促す", () => {
  const h = harness({ lockAvailable: false });
  assert.equal(h.submit(), "BUSY");
  assert.equal(h.calls.length, 0);
  assert.equal(h.state.releases, 0);
});

test("同じ送信IDで再送しても予定と招待を再作成しない", () => {
  const h = harness();
  assert.equal(h.submit(), "OK");
  assert.equal(h.submit(), "OK");
  assert.equal(h.state.insertions, 1);
  assert.equal(h.calls.filter((c) => c.url.endsWith("/freeBusy")).length, 1);
});

test("Googleに登録済みで応答だけ失われても再送で復旧する", () => {
  let loseResponse = true;
  const h = harness({ afterInsert: () => { if (loseResponse) { loseResponse = false; throw new Error("response lost"); } } });
  assert.equal(h.submit(), "UNAVAILABLE");
  assert.equal(h.submit(), "OK");
  assert.equal(h.state.insertions, 1);
});

test("別の送信IDで同じ時間を予約しようとしても拒否する", () => {
  const h = harness();
  assert.equal(h.submit(), "OK");
  const fetchOriginal = h.context.UrlFetchApp.fetch;
  h.context.UrlFetchApp.fetch = (url, options) => {
    if (!url.endsWith("/freeBusy")) return fetchOriginal(url, options);
    const event = [...h.events.values()][0];
    return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ calendars: {
      "noda@example.com": { busy: [{ start: event.start.dateTime, end: event.end.dateTime }] },
    } }) };
  };
  assert.equal(h.submit({ ...input, requestId: "aaaaaaaa-1234-4234-8234-123456789abc" }), "CONFLICT");
  assert.equal(h.state.insertions, 1);
});

test("同じ送信IDを別の利用者・時間に流用しない", () => {
  const h = harness();
  assert.equal(h.submit(), "OK");
  assert.equal(h.submit({ ...input, email: "other@example.com" }), "REQUEST_MISMATCH");
});

test("管理者が時刻を変更した予約の再送は元の時刻で成功としない", () => {
  const h = harness();
  h.submit();
  [...h.events.values()][0].start.dateTime = "2026-10-06T13:00:00+09:00";
  assert.equal(h.submit(), "REQUEST_MISMATCH");
});

test("キャンセル済みの送信IDを成功として扱わない", () => {
  const h = harness();
  h.submit();
  [...h.events.values()][0].status = "cancelled";
  assert.equal(h.submit(), "CANCELLED");
});

test("秘密値が違う場合はGoogleへアクセスしない", () => {
  const h = harness();
  assert.equal(h.submit(input, "wrong"), "UNAUTHORIZED");
  assert.equal(h.calls.length, 0);
});

test("予定登録が失敗してもロックを解放し、成功と返さない", () => {
  const h = harness({ failInsert: true });
  assert.equal(h.submit(), "UNAVAILABLE");
  assert.equal(h.state.releases, 1);
});

test("フォーム側と公開バックエンド側の日時検証が一致する", () => {
  const h = harness();
  for (const patch of [{}, { date: "2026-02-30" }, { date: "2026-12-29" }, { endTime: "09:00" }, { date: "2026-10-05", startTime: "08:00" }, { name: "\n" }, { email: "invalid" }, { requestId: "invalid" }, { resource: "studio", date: "2027-01-05" }, { resource: "studio", startTime: "09:00" }, { resource: "studio", endTime: "21:00" }, { resource: "other" }]) {
    const value = { ...input, ...patch };
    let valid = true;
    try { validateBooking(value, now); } catch { valid = false; }
    assert.equal(Boolean(h.context.prepareBooking(value, now)), valid);
  }
});

test("空き閲覧は選択した施設の一日を照会し、予定や招待を作らない", () => {
  const h = harness({ lockAvailable: false, calendars: { "studio@example.com": { busy: [
    { start: "2026-10-06T12:00:00+09:00", end: "2026-10-06T14:00:00+09:00", summary: "private name", email: "private@example.com" },
  ] } } });
  const result = h.availability({ resource: "studio", date: input.date });
  assert.deepEqual(result, { code: "OK", busy: [{ start: "2026-10-06T03:00:00.000Z", end: "2026-10-06T05:00:00.000Z" }] });
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].body.items, [{ id: "studio@example.com" }]);
  assert.equal(h.calls[0].body.timeMin, "2026-10-06T00:00:00+09:00");
  assert.equal(h.calls[0].body.timeMax, "2026-10-07T00:00:00+09:00");
  assert.equal(h.state.insertions, 0);
  assert.equal(h.state.releases, 0);
});

test("空き閲覧も施設に対応する追加カレンダーを参照する", () => {
  const h = harness({ properties: { CONFLICT_CALENDAR_IDS: '{"noda":["external@example.com"]}' } });
  assert.equal(h.availability().code, "OK");
  assert.deepEqual(h.calls[0].body.items.map((item) => item.id), ["noda@example.com", "external@example.com"]);
});

test("空き閲覧はカレンダーの権限エラーを空きとしない", () => {
  const h = harness({ calendars: { "noda@example.com": { errors: [{ reason: "forbidden" }] } } });
  assert.deepEqual(h.availability(), { code: "UNAVAILABLE" });
});

test("空き閲覧も秘密値が違えばGoogleへアクセスしない", () => {
  const h = harness();
  assert.equal(h.availability(undefined, "wrong").code, "UNAUTHORIZED");
  assert.equal(h.calls.length, 0);
});

test("空き閲覧の施設・日付検証はWeb側と一致する", () => {
  const h = harness();
  for (const query of [{}, { resource: "other", date: input.date }, { resource: "noda", date: "2026-02-30" }, { resource: "noda", date: "2026-10-04" }, { resource: "noda", date: "2026-12-29" }]) {
    assert.equal(h.availability(query).code, "INVALID");
  }
  assert.equal(h.calls.length, 0);
});

test("空き表示後に別の予約が入ったら送信時に拒否する", () => {
  const h = harness();
  assert.deepEqual(h.availability(), { code: "OK", busy: [] });
  assert.equal(h.submit({ ...input, requestId: "aaaaaaaa-1234-4234-8234-123456789abc" }), "OK");
  assert.equal(h.submit(), "CONFLICT");
  assert.equal(h.state.insertions, 1);
});

test("予定の削除が空き閲覧に反映される", () => {
  const h = harness();
  h.submit();
  assert.equal(h.availability().busy.length, 1);
  h.events.clear();
  assert.deepEqual(h.availability(), { code: "OK", busy: [] });
});
