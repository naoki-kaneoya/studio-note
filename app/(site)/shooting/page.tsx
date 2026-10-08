import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "撮影を依頼したい方へ",
  description:
    "商品撮影からポートレート、動画まで。法人・店舗の撮影を企画から納品までサポート。スタジオ撮影・出張撮影に対応します。",
};

const eyebrow: React.CSSProperties = { fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" };
const h2: React.CSSProperties = { margin: "16px 0 0", fontWeight: 700, fontSize: "clamp(24px,3.4vw,38px)", lineHeight: 1.4 };

const FIELDS = [
  { no: "01", title: "商品・物撮り", body: "EC・カタログ・LP用の商品撮影。テザー環境で色と質感を確認しながら撮影します。", img: "/usecase-product.jpg" },
  { no: "02", title: "人物・ポートレート", body: "採用・コーポレート・タレント／モデルの宣材、アー写。ライティングを組んだ本格撮影。", img: "/usecase-portrait.jpg" },
  { no: "03", title: "動画・ムービー", body: "商品紹介、採用、SNS用ショート動画、インタビューなど。企画から撮影・編集まで。", img: "/usecase-video.jpg" },
];

const FLOW = [
  ["01", "お問い合わせ", "下記フォームから撮影内容をお送りください。"],
  ["02", "ヒアリング・お見積り", "内容・ご予算を確認し、撮影プランとお見積りをご提案します。"],
  ["03", "撮影", "スタジオまたは出張先で撮影を行います。"],
  ["04", "納品", "レタッチ・編集のうえデータで納品します。"],
];

export default function ShootingPage() {
  return (
    <main>
      <section style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(40px,5vw,56px)" }}>
        <div className="dc-wrap dc-fadeup">
          <span style={eyebrow}>Shooting</span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            撮影のご依頼。
          </h1>
          <p style={{ margin: "22px 0 0", maxWidth: 600, color: "#555", fontSize: 16, lineHeight: 1.95 }}>
            Studio note を運営する撮影チームが、商品撮影からポートレート、動画まで、事業者さまの撮影を承ります。スタジオ撮影はもちろん、出張撮影にも対応します。
          </p>
        </div>
      </section>

      {/* 対応領域 */}
      <section style={{ background: "#F7F6F4", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap">
          <div className="dc-reveal">
            <span style={eyebrow}>Field</span>
            <h2 style={h2}>対応領域</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(16px,2vw,28px)", marginTop: "clamp(36px,4vw,56px)" }}>
            {FIELDS.map((f) => (
              <div key={f.no} className="dc-reveal" style={{ background: "#FFFFFF", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#eceae6" }}>
                  <Image src={f.img} alt={f.title} width={460} height={345} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "26px 24px 30px" }}>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 11, letterSpacing: "0.24em", color: "#999" }}>{f.no}</span>
                  <h3 style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 19 }}>{f.title}</h3>
                  <p style={{ margin: "12px 0 0", color: "#555", fontSize: 14, lineHeight: 1.9 }}>{f.body}</p>
                  <p style={{ margin: "14px 0 0", fontSize: 12, color: "#b9b6b0" }}>制作事例は準備中</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 出張対応 */}
      <section style={{ background: "#FFFFFF", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(36px,5vw,72px)", alignItems: "center" }}>
          <div className="dc-reveal" style={{ overflow: "hidden", aspectRatio: "5/4", borderRadius: 3, background: "#eceae6" }}>
            <Image src="/usecase-video.jpg" alt="出張撮影" width={760} height={608} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="dc-reveal">
            <span style={eyebrow}>On-site</span>
            <h2 style={h2}>スタジオ撮影／出張撮影に対応。</h2>
            <p style={{ margin: "22px 0 0", color: "#555", fontSize: 16, lineHeight: 1.95 }}>
              庄内のスタジオでの撮影はもちろん、貴社オフィス・店舗・ロケ地への出張撮影も承ります。スタジオに持ち込めない大型商品や、現地での撮影が必要な場合もご相談ください。
            </p>
            <p style={{ margin: "18px 0 0", color: "#555", fontSize: 15, lineHeight: 1.95 }}>
              対応エリア・出張費はご依頼内容に応じてお見積りします。
            </p>
          </div>
        </div>
      </section>

      {/* 流れ */}
      <section style={{ background: "#F7F6F4", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap">
          <div className="dc-reveal">
            <span style={eyebrow}>Flow</span>
            <h2 style={h2}>ご依頼の流れ</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "clamp(24px,3vw,44px)", marginTop: "clamp(40px,5vw,68px)" }}>
            {FLOW.map(([no, t, b]) => (
              <div key={no} className="dc-reveal">
                <span style={{ fontFamily: "Georgia,serif", fontSize: "clamp(40px,5vw,56px)", lineHeight: 1, color: "rgba(26,42,64,0.18)" }}>{no}</span>
                <h3 style={{ margin: "16px 0 0", fontWeight: 700, fontSize: 18 }}>{t}</h3>
                <p style={{ margin: "12px 0 0", color: "#555", fontSize: 14, lineHeight: 1.9 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フォーム */}
      <section id="form" style={{ background: "#FFFFFF", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="dc-reveal" style={{ textAlign: "center" }}>
            <span style={eyebrow}>Contact</span>
            <h2 style={h2}>お問い合わせ</h2>
            <p style={{ margin: "18px 0 0", color: "#555", fontSize: 15, lineHeight: 1.9 }}>
              下記フォームよりお送りください。内容を確認のうえ、担当者よりご連絡いたします。
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
