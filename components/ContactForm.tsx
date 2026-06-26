"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/gtag";

const GENRES = ["物撮り", "ポートレート/宣材", "映像", "その他"];
const PLACES = ["スタジオ", "出張", "未定"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 15,
  color: "#2A2A2A",
  background: "#FAF9F7",
  border: "1px solid rgba(42,42,42,0.18)",
  borderRadius: 2,
  transition: "border-color .15s",
};
const labelStyle: React.CSSProperties = { fontSize: 13, letterSpacing: "0.04em", color: "#2A2A2A" };
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 9 };

function Badge({ required }: { required?: boolean }) {
  return required ? (
    <span style={{ fontSize: 11, color: "#fff", background: "#1A2A40", padding: "2px 8px", borderRadius: 999, marginLeft: 4 }}>必須</span>
  ) : (
    <span style={{ fontSize: 11, color: "#888", border: "1px solid rgba(42,42,42,0.25)", padding: "2px 8px", borderRadius: 999, marginLeft: 4 }}>任意</span>
  );
}

export default function ContactForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(json?.message || "送信に失敗しました。");
      }
      trackEvent("contact_submit", { genre: data.genre });
      router.push("/thanks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: "clamp(36px,4vw,56px)", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ハニーポット */}
      <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
        <label>
          ご担当者URL
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>会社名・団体名 <Badge required /></label>
          <input type="text" name="company" placeholder="株式会社◯◯" style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>ご担当者名 <Badge required /></label>
          <input type="text" name="name" placeholder="山田 太郎" style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>メールアドレス <Badge required /></label>
          <input type="email" name="email" placeholder="you@example.com" style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>電話番号 <Badge /></label>
          <input type="tel" name="tel" placeholder="090-0000-0000" style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>撮影ジャンル <Badge required /></label>
          <select name="genre" defaultValue="" style={inputStyle}>
            <option value="" disabled>選択してください</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>撮影場所 <Badge required /></label>
          <select name="place" defaultValue="" style={inputStyle}>
            <option value="" disabled>選択してください</option>
            {PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>希望時期 <Badge /></label>
          <input type="text" name="period" placeholder="2026年8月頃" style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>ご予算感 <Badge /></label>
          <input type="text" name="budget" placeholder="20万円程度" style={inputStyle} />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>撮影内容・ご相談 <Badge required /></label>
        <textarea name="message" rows={6} placeholder="撮影の目的、点数、希望日、納期などをお知らせください。" style={{ ...inputStyle, lineHeight: 1.8, resize: "vertical" }} />
      </div>

      {error && <p style={{ margin: 0, color: "#b3261e", fontSize: 14 }}>{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="dc-btn dc-btn-primary"
        style={{ alignSelf: "center", padding: "17px 56px", opacity: submitting ? 0.5 : 1 }}
      >
        {submitting ? "送信中…" : "送信する"}
      </button>
      <p style={{ margin: 0, textAlign: "center", fontSize: 12, color: "#999", lineHeight: 1.8 }}>
        送信内容はお問い合わせ対応のみに利用します。
      </p>
    </form>
  );
}
