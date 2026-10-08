/** このプロジェクトはWebアプリとして「自分として実行」でデプロイする。 */
function doPost(event) {
  var lock;
  var locked = false;
  try {
    var properties = PropertiesService.getScriptProperties();
    var secret = properties.getProperty("BOOKING_BACKEND_SECRET");
    var calendarConfig = properties.getProperty("BOOKING_CALENDARS");
    if (!secret || !calendarConfig) return bookingResponse("UNAVAILABLE");
    var raw = event && event.postData && event.postData.contents;
    if (typeof raw !== "string" || raw.length > 8192) return bookingResponse("INVALID");
    var payload;
    try { payload = JSON.parse(raw); } catch (_) { return bookingResponse("INVALID"); }
    if (!payload || typeof payload.secret !== "string" || !sameSecret(payload.secret, secret)) {
      return bookingResponse("UNAUTHORIZED");
    }
    var viewing = payload.action === "availability";
    if (payload.action && !viewing) return bookingResponse("INVALID");
    var booking = viewing ? prepareAvailability(payload.availability, new Date()) : prepareBooking(payload.booking, new Date());
    if (!booking) return bookingResponse("INVALID");

    var calendars = JSON.parse(calendarConfig);
    if (!calendars || Array.isArray(calendars) ||
      typeof calendars.studio !== "string" || !calendars.studio.trim() ||
      typeof calendars.noda !== "string" || !calendars.noda.trim() ||
      calendars.studio.trim() === calendars.noda.trim()) {
      return bookingResponse("UNAVAILABLE");
    }
    var calendarId = calendars[booking.resource].trim();
    var resourceName = booking.resource === "studio" ? "Studio note（庄内）" : "野田小学校スタジオ";

    var extra = properties.getProperty("CONFLICT_CALENDAR_IDS");
    var extraByResource = extra ? JSON.parse(extra) : {};
    if (!extraByResource || typeof extraByResource !== "object" || Array.isArray(extraByResource)) {
      return bookingResponse("UNAVAILABLE");
    }
    var ids = extraByResource[booking.resource] || [];
    if (!Array.isArray(ids) || ids.some(function (id) { return typeof id !== "string" || !id.trim(); })) {
      return bookingResponse("UNAVAILABLE");
    }
    ids = Array.from(new Set([calendarId].concat(ids)));
    if (ids.length > 50) return bookingResponse("UNAVAILABLE");

    var token = ScriptApp.getOAuthToken();
    if (viewing) {
      var dayBusy = readBusyPeriods(ids, booking.dayStart, booking.dayEnd, token);
      return dayBusy === null ? bookingResponse("UNAVAILABLE") : bookingResponse("OK", { busy: dayBusy });
    }

    // ScriptLockはGoogle側で管理され、全サーバー・全デプロイからの送信に共有される。
    // 空き確認から予定の登録までロックを保持し、途中で早期解放しない。
    lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return bookingResponse("BUSY");
    locked = true;

    var eventId = "stnote" + digestHex(booking.resource + ":" + booking.requestId.toLowerCase());
    var fingerprint = digestHex(JSON.stringify([
      booking.resource, booking.name, booking.email, booking.date, booking.startTime, booking.endTime
    ]));
    var eventPath = "/calendars/" + encodeURIComponent(calendarId) + "/events/" + eventId;
    var previous = calendarRequest("get", eventPath, undefined, token);
    if (previous.status === 200) {
      return bookingResponse(existingBookingCode(previous.body, fingerprint, booking));
    }
    if (previous.status === 410) return bookingResponse("CANCELLED");
    if (previous.status !== 404) return bookingResponse("UNAVAILABLE");

    var busy = readBusyPeriods(ids, booking.startAt, booking.endAt, token);
    if (busy === null) return bookingResponse("UNAVAILABLE");
    if (busy.some(function (period) {
      return Date.parse(period.start) < Date.parse(booking.endAt) && Date.parse(period.end) > Date.parse(booking.startAt);
    })) return bookingResponse("CONFLICT");

    var created = calendarRequest("post", "/calendars/" + encodeURIComponent(calendarId) + "/events?sendUpdates=all", {
      id: eventId,
      summary: resourceName + "予約｜" + booking.name,
      location: resourceName,
      description: "予約フォームからの予約です。変更・キャンセルは管理者へご連絡ください。",
      start: { dateTime: booking.startAt, timeZone: "Asia/Tokyo" },
      end: { dateTime: booking.endAt, timeZone: "Asia/Tokyo" },
      attendees: [{ email: booking.email, displayName: booking.name }],
      transparency: "opaque",
      visibility: "private",
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: false,
      extendedProperties: { private: { studioNoteFingerprint: fingerprint, studioNoteResource: booking.resource } }
    }, token);
    if ((created.status === 200 || created.status === 201) && created.body.id === eventId) {
      return bookingResponse("OK");
    }
    // 通信再送で同じIDが既に作られていれば、内容を照合して同じ結果を返す。
    if (created.status === 409) {
      var duplicate = calendarRequest("get", eventPath, undefined, token);
      if (duplicate.status === 200) return bookingResponse(existingBookingCode(duplicate.body, fingerprint, booking));
    }
    return bookingResponse("UNAVAILABLE");
  } catch (_) {
    // アカウント情報、メールアドレス、秘密値、Googleのエラー本文を応答やログへ出さない。
    return bookingResponse("UNAVAILABLE");
  } finally {
    if (locked) lock.releaseLock();
  }
}

function doGet() { return bookingResponse("METHOD_NOT_ALLOWED"); }

function bookingResponse(code, data) {
  return ContentService.createTextOutput(JSON.stringify(Object.assign({ code: code }, data || {})))
    .setMimeType(ContentService.MimeType.JSON);
}

// 閲覧と予約送信で同じカレンダー・権限検証を使う。公開するのは時間帯だけ。
function readBusyPeriods(ids, startAt, endAt, token) {
  var response = calendarRequest("post", "/freeBusy", {
    timeMin: startAt, timeMax: endAt, timeZone: "Asia/Tokyo",
    items: ids.map(function (id) { return { id: id }; })
  }, token);
  if (response.status !== 200 || !response.body.calendars) return null;
  var periods = [];
  for (var i = 0; i < ids.length; i++) {
    var calendar = response.body.calendars[ids[i]];
    // 参照できないカレンダーを「空き」として扱わない。
    if (!calendar || (calendar.errors && (!Array.isArray(calendar.errors) || calendar.errors.length)) || !Array.isArray(calendar.busy)) return null;
    for (var j = 0; j < calendar.busy.length; j++) {
      var period = calendar.busy[j];
      if (!period || typeof period.start !== "string" || typeof period.end !== "string") return null;
      var start = Date.parse(period.start), end = Date.parse(period.end);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
      periods.push({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
    }
  }
  return periods;
}

function prepareAvailability(input, now) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (input.resource !== "studio" && input.resource !== "noda") return null;
  if (typeof input.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return null;
  var date = new Date(input.date + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== input.date) return null;
  var today = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (input.date < today || (input.resource === "noda" && input.date > "2026-12-28")) return null;
  return {
    resource: input.resource, date: input.date,
    dayStart: input.date + "T00:00:00+09:00",
    dayEnd: new Date(date.getTime() + 86400000).toISOString().slice(0, 10) + "T00:00:00+09:00"
  };
}

function calendarRequest(method, path, body, token) {
  var options = {
    method: method,
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true,
    followRedirects: false
  };
  if (body !== undefined) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(body);
  }
  var response = UrlFetchApp.fetch("https://www.googleapis.com/calendar/v3" + path, options);
  var text = response.getContentText();
  return { status: response.getResponseCode(), body: text ? JSON.parse(text) : {} };
}

function existingBookingCode(event, fingerprint, booking) {
  if (event.status === "cancelled") return "CANCELLED";
  var sameTimes = event.start && event.end &&
    Date.parse(event.start.dateTime) === Date.parse(booking.startAt) &&
    Date.parse(event.end.dateTime) === Date.parse(booking.endAt);
  var invited = event.attendees && event.attendees.some(function (attendee) {
    return attendee.email.toLowerCase() === booking.email.toLowerCase();
  });
  return sameTimes && invited && event.extendedProperties && event.extendedProperties.private &&
    event.extendedProperties.private.studioNoteFingerprint === fingerprint ? "OK" : "REQUEST_MISMATCH";
}

function sameSecret(left, right) {
  var a = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, left, Utilities.Charset.UTF_8);
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, right, Utilities.Charset.UTF_8);
  var difference = 0;
  for (var i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

function digestHex(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8)
    .map(function (byte) { return ((byte + 256) % 256).toString(16).padStart(2, "0"); }).join("");
}

function prepareBooking(input, now) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  var fields = ["resource", "name", "email", "date", "startTime", "endTime", "requestId"];
  var booking = {};
  for (var i = 0; i < fields.length; i++) {
    var key = fields[i];
    if (typeof input[key] !== "string") return null;
    booking[key] = input[key].trim();
  }
  if (booking.resource !== "studio" && booking.resource !== "noda") return null;
  if (!booking.name || booking.name.length > 80 || /[\r\n\x00-\x1f]/.test(booking.name)) return null;
  if (booking.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) return null;
  var date = new Date(booking.date + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== booking.date) return null;
  if (booking.resource === "noda" && booking.date > "2026-12-28") return null;
  var timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(booking.startTime) || !timePattern.test(booking.endTime) || booking.endTime <= booking.startTime) return null;
  if (booking.resource === "studio" && (booking.startTime < "10:00" || booking.endTime > "20:00")) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(booking.requestId)) return null;
  booking.startAt = booking.date + "T" + booking.startTime + ":00+09:00";
  booking.endAt = booking.date + "T" + booking.endTime + ":00+09:00";
  if (Date.parse(booking.startAt) <= now.getTime()) return null;
  return booking;
}
