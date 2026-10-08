import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "Studio note の利用規約。予約・料金・キャンセル・禁止事項・原状復帰・免責について。キャンセルポリシーはUpnowの規定に準じます。",
};

const ARTICLES = [
  ["第1条（予約・利用）", "ご予約は予約システム（Upnow）より行うものとします。利用時間には、準備・撤収・原状復帰に要する時間を含みます。"],
  ["第2条（料金・支払い）", "料金および支払い方法は予約システムの表示に従います。オプション利用分は別途加算されます。"],
  ["第3条（キャンセル）", "キャンセルポリシーは予約システム（Upnow）の規定に準じます。詳細はご予約時の表示および予約システムの案内をご確認ください。"],
  ["第4条（禁止事項）", "館内は全面禁煙です（電子タバコ含む）。火気の使用、設備・什器を損傷する行為、大音量・強い匂いを伴う飲食、第三者への迷惑行為、公序良俗に反する撮影はお断りします。"],
  ["第5条（原状復帰・損害）", "利用後は原状復帰・床清掃・ゴミの持ち帰りのうえご退室ください。未実施の場合は復帰・清掃料として¥30,000を申し受けます。設備・什器を破損・汚損した場合、修繕費等をご負担いただく場合があります。"],
  ["第6条（防犯・免責）", "館内・スタジオ内には防犯カメラを常時稼働しています。利用者の故意・過失による事故、盗難、紛失等について当スタジオは責任を負いません。お問い合わせは公式LINEより承ります。"],
];

export default function TermsPage() {
  return (
    <main style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(80px,12vw,128px)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="dc-fadeup">
          <span style={{ fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" }}>
            Terms
          </span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            利用規約
          </h1>
          <p style={{ margin: "22px 0 0", color: "#555", fontSize: 15, lineHeight: 1.95 }}>
            本規約は、Studio note（以下「当スタジオ」）の利用に関する条件を定めるものです。ご利用にあたっては本規約に同意いただいたものとみなします。
          </p>
        </div>

        <div style={{ marginTop: "clamp(40px,5vw,64px)" }}>
          {ARTICLES.map(([h, b], i) => (
            <div key={h} style={{ padding: "28px 0", borderTop: "1px solid rgba(42,42,42,0.14)", borderBottom: i === ARTICLES.length - 1 ? "1px solid rgba(42,42,42,0.14)" : undefined }}>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{h}</h2>
              <p style={{ margin: "14px 0 0", color: "#444", fontSize: 15, lineHeight: 1.95 }}>{b}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: "clamp(36px,4vw,52px)", fontSize: 13, color: "#999" }}>制定日：2026年1月1日</p>
      </div>
    </main>
  );
}
