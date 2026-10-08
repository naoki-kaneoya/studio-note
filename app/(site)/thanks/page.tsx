import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせありがとうございます",
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(48px,8vw,96px) clamp(20px,5vw,32px)" }}>
      <div className="dc-fadeup" style={{ maxWidth: 560, textAlign: "center" }}>
        <span style={{ fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" }}>
          Thank you
        </span>
        <h1 style={{ margin: "20px 0 0", fontWeight: 700, fontSize: "clamp(28px,4.5vw,46px)", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
          送信が完了しました。
        </h1>
        <p style={{ margin: "24px 0 0", color: "#555", fontSize: 16, lineHeight: 2 }}>
          お問い合わせいただきありがとうございます。
          <br />
          内容を確認のうえ、担当者よりご返信します。
          <br />
          お急ぎの場合は公式LINEよりご連絡ください。
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 40 }}>
          <Link href="/" className="dc-btn dc-btn-primary">トップへ戻る</Link>
          <Link href="/studio" className="dc-btn dc-btn-outline">スタジオを見る</Link>
        </div>
      </div>
    </main>
  );
}
