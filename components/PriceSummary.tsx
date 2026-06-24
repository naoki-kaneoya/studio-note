/** 料金サマリ（トップ/料金ページ共用の見出しブロック）。 */
export default function PriceSummary() {
  return (
    <div className="rounded-lg border border-ink/10 bg-offwhite p-7">
      <p className="text-3xl font-bold text-accent">
        1時間 ¥4,400<span className="text-base font-medium">〜（税込）</span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink/80">
        平日・土日祝で料金が変わります。利用時間 10:00–20:00。背景紙は有料オプション。
        <br />
        最安値での予約・最新の空き状況は Upnow からご確認ください。
      </p>
    </div>
  );
}
