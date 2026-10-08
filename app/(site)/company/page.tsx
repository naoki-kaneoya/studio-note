import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "Studio note の運営者情報。株式会社Cloud Illusion／株式会社ウツセバ。",
};

const ROWS = [
  ["施設名", "Studio note（スタジオ ノート）"],
  ["所在地", "大阪府豊中市庄内西町3-1-5\nサンパティオビル3階"],
  ["アクセス", "阪急宝塚線「庄内駅」徒歩1分"],
  ["営業時間", "10:00 – 20:00（無人運営）"],
  ["事業内容", "レンタルスタジオ運営／撮影サービス"],
  ["運営会社", "株式会社Cloud Illusion\n株式会社ウツセバ"],
  ["お問い合わせ", "公式LINE／撮影依頼フォーム"],
];

export default function CompanyPage() {
  return (
    <main style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(80px,12vw,128px)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="dc-fadeup">
          <span style={{ fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" }}>
            Company
          </span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            運営者情報
          </h1>
        </div>

        <div style={{ marginTop: "clamp(40px,5vw,64px)" }}>
          {ROWS.map(([k, v], i) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "20px 24px", padding: "24px 0", borderTop: "1px solid rgba(42,42,42,0.14)", borderBottom: i === ROWS.length - 1 ? "1px solid rgba(42,42,42,0.14)" : undefined, fontSize: 15, lineHeight: 1.85 }}>
              <span style={{ color: "#999" }}>{k}</span>
              <span style={{ whiteSpace: "pre-line" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: "clamp(36px,4vw,52px)" }}>
          <Link href="/shooting" className="dc-btn dc-btn-primary">撮影を依頼する</Link>
          <Link href="/#access" className="dc-btn dc-btn-outline">アクセスを見る</Link>
        </div>
      </div>
    </main>
  );
}
