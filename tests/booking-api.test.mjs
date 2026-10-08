import test from "node:test";
import assert from "node:assert/strict";
import { apiHarness } from "./helpers/api-harness.mjs";

const input = {
  resource: "noda",
  name: "山田 太郎", email: "member@example.com", date: "2026-10-06",
  startTime: "10:00", endTime: "12:00", requestId: "12345678-1234-4234-8234-123456789abc",
};

function handler({ env = {}, backendCode = "OK", failure = false } = {}) {
  const { invoke, calls } = apiHarness("bookings", { env, backendResult: { code: backendCode }, failure });
  const send = (payload = input, headers = {}, raw = false) => invoke(new Request("https://studio.example/api/bookings", {
    method: "POST", headers: { "Content-Type": "application/json", ...headers },
    body: raw ? payload : JSON.stringify(payload),
  }));
  return { send, calls };
}

test("APIはログインや合言葉なしで、選択した施設の予約を転送する", async () => {
  const h = handler();
  const response = await h.send({ ...input, name: " 山田 太郎 " });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.booking.name, input.name);
  assert.equal(result.booking.resource, "noda");
  assert.equal(result.booking.resourceName, "野田小学校スタジオ");
  assert.equal(JSON.stringify(result).includes("secret"), false);
  const forwarded = JSON.parse(h.calls[0].options.body);
  assert.equal(forwarded.secret, "test-backend-secret");
  assert.equal(forwarded.booking.startAt, "2026-10-06T10:00:00+09:00");
  assert.equal("accessCode" in forwarded.booking, false);
});

test("存在しない施設には予約を転送しない", async () => {
  const h = handler();
  assert.equal((await h.send({ ...input, resource: "other" })).status, 400);
  assert.equal(h.calls.length, 0);
});

test("庄内を選べば受付結果にも庄内が表示される", async () => {
  const h = handler();
  const response = await h.send({ ...input, resource: "studio" });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).booking.resourceName, "Studio note（庄内）");
  assert.equal(JSON.parse(h.calls[0].options.body).booking.resource, "studio");
});

test("Google接続未設定では予約を受け付けない", async () => {
  const h = handler({ env: { GOOGLE_BOOKING_SECRET: "" } });
  assert.equal((await h.send()).status, 503);
  assert.equal(h.calls.length, 0);
});

test("Google以外の転送先やログイン用テストURLは使わない", async () => {
  for (const url of ["https://other.example/exec", "https://script.google.com/macros/s/test/dev", "https://script.google.com/macros/s/test/exec?secret=visible"]) {
    const h = handler({ env: { GOOGLE_BOOKING_SCRIPT_URL: url } });
    assert.equal((await h.send()).status, 503);
    assert.equal(h.calls.length, 0);
  }
});

test("別サイトからの送信は拒否する", async () => {
  const h = handler();
  assert.equal((await h.send(input, { Origin: "https://other.example" })).status, 403);
  assert.equal(h.calls.length, 0);
});

test("HTTPSトンネルからの予約は設定済みの公開元から受け付ける", async () => {
  const { invoke, calls } = apiHarness("bookings", { env: { BOOKING_SITE_ORIGIN: "https://booking.example" } });
  const response = await invoke(new Request("http://127.0.0.1:3000/api/bookings", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "https://booking.example" }, body: JSON.stringify(input),
  }));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
});

test("公開元設定後も他のサイトからの予約は転送しない", async () => {
  const { invoke, calls } = apiHarness("bookings", { env: { BOOKING_SITE_ORIGIN: "https://booking.example" } });
  const response = await invoke(new Request("http://127.0.0.1:3000/api/bookings", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "https://other.example", "X-Forwarded-Host": "other.example" }, body: JSON.stringify(input),
  }));
  assert.equal(response.status, 403);
  assert.equal(calls.length, 0);
});

test("転送ヘッダーだけでは予約の公開元を許可しない", async () => {
  const h = handler();
  assert.equal((await h.send(input, { Origin: "https://other.example", "X-Forwarded-Host": "other.example", "X-Forwarded-Proto": "https" })).status, 403);
  assert.equal(h.calls.length, 0);
});

for (const origin of ["http://booking.example", "https://booking.example/", "https://booking.example/book", "https://booking.example?token=value", "https://user:password@booking.example"]) {
  test("不正な公開元設定では受付を止める: " + origin, async () => {
    const h = handler({ env: { BOOKING_SITE_ORIGIN: origin } });
    assert.equal((await h.send()).status, 503);
    assert.equal(h.calls.length, 0);
  });
}

test("フォーム以外の形式・不正JSON・大きすぎる本文は転送しない", async () => {
  const h = handler();
  assert.equal((await h.send(input, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await h.send("{", {}, true)).status, 400);
  assert.equal((await h.send("a".repeat(8193), {}, true)).status, 400);
  assert.equal(h.calls.length, 0);
});

test("不正な日時は転送しない", async () => {
  const h = handler();
  assert.equal((await h.send({ ...input, endTime: "09:00" })).status, 400);
  assert.equal(h.calls.length, 0);
});

for (const [code, status] of [["CONFLICT", 409], ["BUSY", 503], ["INVALID", 400], ["CANCELLED", 409], ["REQUEST_MISMATCH", 409], ["UNAUTHORIZED", 503]]) {
  test("バックエンドの" + code + "を成功としない", async () => {
    const h = handler({ backendCode: code });
    assert.equal((await h.send()).status, status);
  });
}

test("外部通信エラーは再送可能とし、秘密値やエラー本文を公開しない", async () => {
  const h = handler({ failure: true });
  const response = await h.send();
  assert.equal(response.status, 503);
  const result = await response.json();
  assert.match(result.message, /入力を変えず/);
  assert.equal(JSON.stringify(result).includes("upstream token"), false);
});
