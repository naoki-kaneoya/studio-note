import type { Metadata } from "next";
import Link from "next/link";
import { getNewsList } from "@/lib/microcms";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "Studio note からのお知らせ一覧。",
};

function catLabel(c?: Category): string | null {
  if (!c) return null;
  return Array.isArray(c) ? c[0] || null : c;
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const pill: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.04em",
  color: "#1A2A40",
  border: "1px solid rgba(26,42,64,0.3)",
  padding: "4px 11px",
  borderRadius: 999,
  whiteSpace: "nowrap",
};

export default async function NewsPage() {
  const news = await getNewsList();
  return (
    <main>
      <section style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(32px,4vw,48px)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }} className="dc-fadeup">
          <span style={{ fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" }}>
            News
          </span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            お知らせ
          </h1>
        </div>
      </section>

      <section style={{ background: "#FFFFFF", padding: "0 clamp(20px,5vw,32px) clamp(80px,12vw,128px)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          {news.length === 0 && <p style={{ color: "#999", fontSize: 15 }}>現在お知らせはありません。</p>}
          {news.map((n, i) => {
            const cat = catLabel(n.category);
            return (
              <Link
                key={n.id}
                href={`/news/${n.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: cat ? "auto auto 1fr" : "auto 1fr",
                  alignItems: "center",
                  gap: "clamp(14px,2vw,28px)",
                  padding: "26px 0",
                  borderTop: "1px solid rgba(42,42,42,0.12)",
                  borderBottom: i === news.length - 1 ? "1px solid rgba(42,42,42,0.12)" : undefined,
                  textDecoration: "none",
                  color: "#2A2A2A",
                }}
              >
                <span style={{ fontFamily: "Georgia,serif", fontSize: 14, letterSpacing: "0.08em", color: "#888" }}>{formatDate(n.publishedAt)}</span>
                {cat && <span style={pill}>{cat}</span>}
                <span style={{ fontSize: 16, lineHeight: 1.6 }}>{n.title}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
