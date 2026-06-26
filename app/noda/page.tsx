import type { Metadata } from "next";
import BookingButton from "@/components/BookingButton";
import Link from "next/link";
import { UPNOW_NODA_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "野田小学校スタジオ",
  description:
    "廃校の小学校をそのまま活かした撮影スタジオ。教室・廊下など街なかにないロケーションで撮影できます。2026年12月28日閉館。庄内駅徒歩5分。",
};

const eyebrow: React.CSSProperties = { fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" };
const h2: React.CSSProperties = { margin: "16px 0 0", fontWeight: 700, fontSize: "clamp(24px,3.4vw,38px)", lineHeight: 1.4 };

export default function NodaPage() {
  return (
    <main>
      {/* 重要告知バー */}
      <div style={{ background: "#1A2A40", color: "#fff", padding: "16px clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#1A2A40", background: "#fff", padding: "4px 11px", borderRadius: 999, fontWeight: 500 }}>
            重要なお知らせ
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.6 }}>
            野田小学校スタジオは <strong style={{ fontWeight: 700 }}>2026年12月28日</strong> をもって閉館いたします。
          </span>
        </div>
      </div>

      <section style={{ background: "#FFFFFF", padding: "clamp(56px,8vw,96px) clamp(20px,5vw,32px) clamp(40px,5vw,56px)" }}>
        <div className="dc-wrap dc-fadeup">
          <span style={eyebrow}>Noda</span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            野田小学校スタジオ
          </h1>
          <p style={{ margin: "22px 0 0", maxWidth: 600, color: "#555", fontSize: 16, lineHeight: 1.95 }}>
            廃校となった小学校をそのまま活かした、独特の趣をもつ撮影スタジオ。教室や廊下など、街なかのスタジオにはないロケーションで撮影いただけます。コスプレ・ポートレート撮影に。
          </p>
          <div style={{ marginTop: 28 }}>
            <BookingButton href={UPNOW_NODA_URL} location="noda" label="予約する（Upnow）" />
          </div>
        </div>
      </section>

      {/* バナー */}
      <section style={{ background: "#FFFFFF", padding: "0 clamp(20px,5vw,32px) clamp(56px,8vw,88px)" }}>
        <div className="dc-wrap dc-reveal" style={{ aspectRatio: "16/7", overflow: "hidden", borderRadius: 3, background: "#eceae6", display: "flex", alignItems: "center", justifyContent: "center", color: "#b9b6b0", fontSize: 13 }}>
          施設写真を準備中
        </div>
      </section>

      {/* 空間ギャラリー（準備中） */}
      <section style={{ background: "#F7F6F4", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap">
          <div className="dc-reveal">
            <span style={eyebrow}>Space</span>
            <h2 style={h2}>空間ギャラリー</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(12px,1.5vw,20px)", marginTop: "clamp(36px,4vw,56px)" }}>
            {["教室", "廊下", "体育館"].map((label) => (
              <div key={label} className="dc-reveal" style={{ aspectRatio: "4/3", borderRadius: 2, background: "#eceae6", display: "flex", alignItems: "center", justifyContent: "center", color: "#b9b6b0", fontSize: 12 }}>
                {label}（準備中）
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 閉館案内 */}
      <section style={{ background: "#FFFFFF", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="dc-reveal">
            <span style={eyebrow}>Closing</span>
            <h2 style={h2}>閉館のご案内</h2>
            <p style={{ margin: "20px 0 0", color: "#555", fontSize: 16, lineHeight: 1.95 }}>
              長らくご愛顧いただきました野田小学校スタジオは、下記日程をもって閉館いたします。これまでのご利用に心より感謝申し上げます。営業終了まで通常どおりご予約いただけます。
            </p>
          </div>
          <div className="dc-reveal" style={{ marginTop: "clamp(32px,4vw,48px)" }}>
            {[
              ["閉館日", "2026年12月28日"],
              ["最終予約受付", "閉館日までの空き状況に準じます（Upnow）"],
              ["アクセス", "庄内駅 徒歩5分"],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "18px 24px", padding: "22px 0", borderTop: "1px solid rgba(42,42,42,0.14)", borderBottom: i === 2 ? "1px solid rgba(42,42,42,0.14)" : undefined, fontSize: 15, lineHeight: 1.8 }}>
                <span style={{ color: "#999" }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          <p className="dc-reveal" style={{ marginTop: 28, color: "#555", fontSize: 15, lineHeight: 1.95 }}>
            閉館後は、庄内のホワイトスタジオ「Studio note」にて引き続き皆さまの撮影をサポートいたします。ご不明な点は公式LINEよりお問い合わせください。
          </p>
          <div className="dc-reveal" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
            <Link href="/" className="dc-btn dc-btn-primary">庄内スタジオを見る</Link>
            <Link href="/shooting" className="dc-btn dc-btn-outline">撮影を依頼する</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
