import type { Metadata } from "next";
import Link from "next/link";
import BookingButton from "@/components/BookingButton";
import { UPNOW_STUDIO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "料金",
  description:
    "1時間 ¥4,400〜（税込）。利用時間10:00–20:00。背景紙は+¥2,200。予約・お支払い・キャンセルはUpnowから承ります。",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "Georgia,serif",
  fontSize: 13,
  letterSpacing: "0.3em",
  color: "#1A2A40",
  textTransform: "uppercase",
};

const OPTIONS = [
  ["背景紙（各色）", "1本あたり。使用した分のみ加算されます。", "+¥2,200"],
  ["延長（30分単位）", "当日の空き状況により承ります。", "+¥2,200"],
  ["原状復帰未実施", "清掃・原状復帰が行われていない場合。", "¥30,000"],
];

const NOTES = [
  "ご予約・お支払いは予約システム（Upnow）から行います。",
  "キャンセルポリシーはUpnowの規定に準じます。詳細はご予約時にご確認ください。",
  "利用時間には準備・撤収・原状復帰の時間を含みます。",
  "不明点は公式LINEへお気軽にお問い合わせください。",
];

export default function PricePage() {
  return (
    <main>
      <section style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(40px,5vw,56px)" }}>
        <div className="dc-wrap dc-fadeup">
          <span style={eyebrow}>Price</span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            料金・ご利用案内
          </h1>
          <p style={{ margin: "22px 0 0", maxWidth: 560, color: "#555", fontSize: 16, lineHeight: 1.95 }}>
            1時間単位のシンプルな時間料金。平日・土日祝で変動します。予約・お支払い・キャンセルは外部システム（Upnow）から承ります。
          </p>
        </div>
      </section>

      {/* レート */}
      <section style={{ background: "#F7F6F4", padding: "clamp(56px,8vw,96px) clamp(20px,5vw,32px)" }}>
        <div
          className="dc-wrap"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(28px,4vw,56px)", alignItems: "stretch" }}
        >
          <div className="dc-reveal" style={{ background: "#FFFFFF", borderRadius: 3, padding: "clamp(36px,4vw,56px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontSize: 13, letterSpacing: "0.1em", color: "#777" }}>レンタル基本料金</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 14 }}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: "clamp(52px,8vw,84px)", lineHeight: 1, color: "#1A2A40" }}>¥4,400</span>
              <span style={{ fontSize: 20, color: "#555" }}>〜 / 時</span>
            </div>
            <span style={{ display: "block", marginTop: 10, fontSize: 14, color: "#777" }}>税込・1時間あたり（時間帯により変動）</span>
          </div>
          <div className="dc-reveal" style={{ background: "#FFFFFF", borderRadius: 3, padding: "clamp(32px,3.5vw,48px)" }}>
            <span style={{ fontSize: 13, letterSpacing: "0.1em", color: "#777" }}>基本情報</span>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column" }}>
              {[
                ["営業時間", "10:00 – 20:00"],
                ["最低利用", "1時間〜"],
                ["予約・支払い", "Upnow（外部）"],
                ["入室方法", "無人・LINE案内"],
              ].map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "16px 0", borderTop: "1px solid rgba(42,42,42,0.12)", borderBottom: i === 3 ? "1px solid rgba(42,42,42,0.12)" : undefined, fontSize: 15 }}>
                  <span style={{ color: "#555" }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* オプション */}
      <section style={{ background: "#FFFFFF", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap">
          <div className="dc-reveal">
            <span style={eyebrow}>Options</span>
            <h2 style={{ margin: "16px 0 0", fontWeight: 700, fontSize: "clamp(24px,3.4vw,38px)", lineHeight: 1.4 }}>オプション</h2>
            <p style={{ margin: "18px 0 0", maxWidth: 560, color: "#555", fontSize: 15, lineHeight: 1.95 }}>
              必要に応じて追加でご利用いただけます。料金はすべて税込です。
            </p>
          </div>
          <div className="dc-reveal" style={{ marginTop: "clamp(36px,4vw,56px)" }}>
            {OPTIONS.map(([t, d, price], i) => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 20, padding: "22px 0", borderTop: "1px solid rgba(42,42,42,0.14)", borderBottom: i === OPTIONS.length - 1 ? "1px solid rgba(42,42,42,0.14)" : undefined }}>
                <div>
                  <span style={{ fontSize: 17 }}>{t}</span>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#888", lineHeight: 1.7 }}>{d}</p>
                </div>
                <span style={{ fontFamily: "Georgia,serif", fontSize: 22, color: "#1A2A40", whiteSpace: "nowrap" }}>{price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ご利用にあたって */}
      <section style={{ background: "#F7F6F4", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(36px,5vw,72px)" }}>
          <div className="dc-reveal">
            <span style={eyebrow}>Notes</span>
            <h2 style={{ margin: "16px 0 0", fontWeight: 700, fontSize: "clamp(24px,3.4vw,38px)", lineHeight: 1.4 }}>ご利用にあたって</h2>
            <p style={{ margin: "18px 0 0", color: "#555", fontSize: 14, lineHeight: 1.9 }}>
              キャンセルポリシー全文は
              <Link href="/terms" style={{ color: "#1A2A40", textDecoration: "underline", textUnderlineOffset: 3 }}>利用規約</Link>
              をご確認ください。
            </p>
          </div>
          <div className="dc-reveal">
            {NOTES.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "18px 0", borderTop: "1px solid rgba(42,42,42,0.12)", borderBottom: i === NOTES.length - 1 ? "1px solid rgba(42,42,42,0.12)" : undefined }}>
                <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#1A2A40" }}>{String(i + 1).padStart(2, "0")}</span>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.85 }}>{n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 予約CTA */}
      <section style={{ background: "#1A2A40", padding: "clamp(64px,9vw,104px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap dc-reveal" style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>
            Booking
          </span>
          <h2 style={{ margin: "18px 0 0", color: "#fff", fontWeight: 700, fontSize: "clamp(26px,4vw,46px)", lineHeight: 1.4 }}>
            撮りたい光を、予約する。
          </h2>
          <p style={{ margin: "18px auto 0", maxWidth: 480, color: "rgba(255,255,255,0.78)", fontSize: 15, lineHeight: 1.9 }}>
            空き状況の確認から予約まで、Upnow からその場で完結できます。
          </p>
          <div style={{ marginTop: 32 }}>
            <BookingButton href={UPNOW_STUDIO_URL} location="price_cta" variant="white" label="予約する（Upnow）" />
          </div>
        </div>
      </section>
    </main>
  );
}
