/**
 * 新規プロジェクトの初期設定。Code.gsと同じプロジェクトへSetup.gsとして追加する。
 * 以下の3つを設定し、エディタ上でsetupBookingを実行する。
 * 秘密値を書き込んだファイルはGitやチャットに掲載しない。
 */
var BOOKING_INITIAL_SETUP = {
  studio: "REPLACE_STUDIO_CALENDAR_ID",
  noda: "REPLACE_NODA_CALENDAR_ID",
  secret: "REPLACE_BOOKING_SECRET"
};

function setupBooking() {
  var setup = BOOKING_INITIAL_SETUP;
  var studio = typeof setup.studio === "string" ? setup.studio.trim() : "";
  var noda = typeof setup.noda === "string" ? setup.noda.trim() : "";
  if (!studio || !noda || /^REPLACE_/.test(studio) || /^REPLACE_/.test(noda) || studio === noda) {
    throw new Error("庄内と野田小学校それぞれの、異なるカレンダーIDを設定してください。");
  }
  if (typeof setup.secret !== "string" || !/^[0-9a-f]{64}$/i.test(setup.secret)) {
    throw new Error("作成済みの64文字の秘密値を設定してください。");
  }
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw new Error("別の処理を実行中です。少し待って再実行してください。");
  try {
    var properties = PropertiesService.getScriptProperties();
    var previousSecret = properties.getProperty("BOOKING_BACKEND_SECRET");
    var previousCalendars = properties.getProperty("BOOKING_CALENDARS");
    // 既に稼働中の接続を、初期設定の再実行で別の値へ切り替えない。
    if (previousSecret && !sameSecret(previousSecret, setup.secret)) {
      throw new Error("既存の秘密値と異なるため変更しません。既存の設定を確認してください。");
    }
    if (previousCalendars) {
      var previous;
      try { previous = JSON.parse(previousCalendars); } catch (_) { previous = null; }
      if (!previous || previous.studio !== studio || previous.noda !== noda) {
        throw new Error("既存のカレンダー設定と異なるため変更しません。既存の設定を確認してください。");
      }
    }
    var token = ScriptApp.getOAuthToken();
    var now = new Date();
    var startAt = now.toISOString();
    var endAt = new Date(now.getTime() + 3600000).toISOString();
    try {
      if (readBusyPeriods([studio, noda], startAt, endAt, token) === null) throw new Error("Unavailable calendars");
      // 予約予定を作らず、予定APIの参照権限を確認する。予定内容は取得しない。
      [studio, noda].forEach(function (id) {
        var result = calendarRequest("get", "/calendars/" + encodeURIComponent(id) + "/events?maxResults=1&fields=kind", undefined, token);
        if (result.status !== 200) throw new Error("Unavailable events API");
      });
    } catch (_) {
      throw new Error("両カレンダーのID・閲覧権限とCalendar APIの有効化を確認してください。Google側の設定は保存していません。");
    }
    properties.setProperties({
      BOOKING_BACKEND_SECRET: setup.secret,
      BOOKING_CALENDARS: JSON.stringify({ studio: studio, noda: noda })
    }, false);
    Logger.log("初期設定を保存し、空き状況と予定APIの参照を確認しました。予定や招待は作成していません。管理者には両カレンダーの『予定の変更』権限も必要です。次にウェブアプリとしてデプロイしてください。");
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
