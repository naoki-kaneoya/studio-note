import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";

const source = readFileSync(new URL("../google-apps-script/Code.gs", import.meta.url), "utf8");
const setupSource = readFileSync(new URL("../google-apps-script/Setup.template.gs", import.meta.url), "utf8");
const initial = { studio: "studio@example.com", noda: "noda@example.com", secret: "a".repeat(64) };

function harness({ properties = {}, busyFailure = false, eventStatus = 200, networkFailure = false, lockAvailable = true } = {}) {
  const config = { ...properties };
  const calls = [], writes = [], logs = [];
  let locked = false, releases = 0;
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({
      getProperty: key => config[key] || null,
      setProperties: (values, deleteOthers) => {
        assert.equal(locked, true);
        assert.equal(deleteOthers, false);
        writes.push({ ...values });
        Object.assign(config, values);
      },
    }) },
    LockService: { getScriptLock: () => ({
      tryLock: () => { locked = lockAvailable; return lockAvailable; },
      releaseLock: () => { assert.equal(locked, true); locked = false; releases++; },
    }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: "sha256" }, Charset: { UTF_8: "utf8" },
      computeDigest: (_, value) => [...createHash("sha256").update(value).digest()],
    },
    ScriptApp: { getOAuthToken: () => "fixture-token" },
    Logger: { log: value => logs.push(value) },
    UrlFetchApp: { fetch: (url, options) => {
      assert.equal(locked, true);
      assert.equal(options.headers.Authorization, "Bearer fixture-token");
      const body = options.payload ? JSON.parse(options.payload) : undefined;
      calls.push({ url, options, body });
      if (networkFailure) throw new Error("Google error contains private@example.com fixture-token");
      let status = 200, result;
      if (url.endsWith("/freeBusy")) {
        result = { calendars: Object.fromEntries(body.items.map(({ id }) => [id, busyFailure ? { errors: [{ reason: "forbidden" }] } : { busy: [] }])) };
      } else {
        assert.equal(options.method, "get");
        assert.ok(url.endsWith("/events?maxResults=1&fields=kind"));
        status = eventStatus;
        result = status === 200 ? { kind: "calendar#events" } : { error: { message: "private Google details" } };
      }
      return { getResponseCode: () => status, getContentText: () => JSON.stringify(result) };
    } },
  });
  vm.runInContext(source, context);
  vm.runInContext(setupSource, context);
  const run = (patch = {}) => { context.BOOKING_INITIAL_SETUP = { ...initial, ...patch }; return context.setupBooking(); };
  return { context, run, config, calls, writes, logs, releases: () => releases };
}

test("初期設定は両施設の参照を確認してから設定を保存し、予約や招待を作らない", () => {
  const h = harness({ properties: { CONFLICT_CALENDAR_IDS: '{"studio":["existing@example.com"]}' } });
  assert.equal(h.run().ok, true);
  assert.equal(h.writes.length, 1);
  assert.equal(h.config.BOOKING_BACKEND_SECRET, initial.secret);
  assert.deepEqual(JSON.parse(h.config.BOOKING_CALENDARS), { studio: initial.studio, noda: initial.noda });
  assert.equal(h.config.CONFLICT_CALENDAR_IDS, '{"studio":["existing@example.com"]}');
  assert.deepEqual(h.calls[0].body.items, [{ id: initial.studio }, { id: initial.noda }]);
  assert.equal(h.calls.length, 3);
  assert.equal(h.calls.some(call => call.url.includes("sendUpdates")), false);
  assert.equal(h.logs.some(log => log.includes(initial.secret)), false);
  assert.equal(h.releases(), 1);
});

for (const patch of [{ studio: "" }, { noda: "REPLACE_NODA_CALENDAR_ID" }, { noda: initial.studio }, { secret: "short" }]) {
  test("未設定・不正な初期値ではGoogleへ通信せず保存もしない: " + Object.keys(patch).join(), () => {
    const h = harness();
    assert.throws(() => h.run(patch));
    assert.equal(h.calls.length, 0);
    assert.equal(h.writes.length, 0);
  });
}

for (const properties of [
  { BOOKING_BACKEND_SECRET: "b".repeat(64) },
  { BOOKING_CALENDARS: '{"studio":"other@example.com","noda":"noda@example.com"}' },
  { BOOKING_CALENDARS: "invalid JSON" },
]) {
  test("既存設定を別の秘密値・カレンダーへ上書きしない: " + Object.keys(properties).join(), () => {
    const h = harness({ properties });
    assert.throws(() => h.run(), /変更しません/);
    assert.equal(h.calls.length, 0);
    assert.equal(h.writes.length, 0);
    assert.equal(h.releases(), 1);
  });
}

test("同じ初期設定の再実行は既存設定を維持する", () => {
  const h = harness();
  h.run(); h.run();
  assert.equal(h.config.BOOKING_BACKEND_SECRET, initial.secret);
  assert.equal(h.writes.length, 2);
  assert.equal(h.releases(), 2);
});

for (const options of [{ busyFailure: true }, { eventStatus: 403 }, { networkFailure: true }]) {
  test("Google参照が失敗したら設定を保存せず、Googleの詳細を公開しない: " + Object.keys(options).join(), () => {
    const h = harness(options);
    assert.throws(() => h.run(), error => /Google側の設定は保存していません/.test(error.message) && !/fixture-token|private/.test(error.message));
    assert.equal(h.writes.length, 0);
    assert.equal(h.releases(), 1);
    assert.equal(h.logs.length, 0);
  });
}

test("別処理の実行中はGoogle設定を変更しない", () => {
  const h = harness({ lockAvailable: false });
  assert.throws(() => h.run(), /別の処理/);
  assert.equal(h.calls.length, 0);
  assert.equal(h.writes.length, 0);
  assert.equal(h.releases(), 0);
});
