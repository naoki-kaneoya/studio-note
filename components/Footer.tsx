import Link from "next/link";
import { SITE } from "@/lib/site";

const MENU = [
  { href: "/studio", label: "スタジオ" },
  { href: "/price", label: "料金" },
  { href: "/shooting", label: "撮影依頼" },
  { href: "/#access", label: "アクセス" },
  { href: "/news", label: "お知らせ" },
  { href: "/company", label: "運営者情報" },
  { href: "/terms", label: "利用規約" },
];

const colLabel: React.CSSProperties = {
  fontFamily: "Georgia,serif",
  fontSize: 11,
  letterSpacing: "0.24em",
  color: "#1A2A40",
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "#FFFFFF",
        borderTop: "1px solid rgba(42,42,42,0.08)",
        padding:
          "clamp(56px,7vw,88px) clamp(20px,5vw,32px) clamp(40px,5vw,56px)",
      }}
    >
      <div
        className="dc-wrap"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 40,
        }}
      >
        <div>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 22 }}>Studio note</span>
          <p style={{ margin: "16px 0 0", fontSize: 13, lineHeight: 1.9, color: "#777" }}>
            大阪・庄内の完全遮光
            <br />
            レンタルホワイトスタジオ
          </p>
        </div>

        <div>
          <span style={colLabel}>MENU</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 18 }}>
            {MENU.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                style={{ fontSize: 14, textDecoration: "none", color: "#2A2A2A" }}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span style={colLabel}>INFO</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              marginTop: 18,
              fontSize: 14,
              color: "#555",
              lineHeight: 1.7,
            }}
          >
            <span>大阪府豊中市庄内西町3-1-5</span>
            <span>サンパティオビル3階</span>
            <span>10:00 – 20:00</span>
          </div>
        </div>

        <div>
          <span style={colLabel}>OPERATED BY</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              marginTop: 18,
              fontSize: 14,
              color: "#555",
              lineHeight: 1.7,
            }}
          >
            {SITE.operators.map((o) => (
              <span key={o}>{o}</span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="dc-wrap"
        style={{
          margin: "clamp(40px,5vw,64px) auto 0",
          paddingTop: 24,
          borderTop: "1px solid rgba(42,42,42,0.08)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontFamily: "Georgia,serif", fontSize: 11, letterSpacing: "0.18em", color: "#999" }}>
          © Studio note
        </span>
        <span style={{ fontFamily: "Georgia,serif", fontSize: 11, letterSpacing: "0.18em", color: "#999" }}>
          Osaka Shonai
        </span>
      </div>
    </footer>
  );
}
