import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsDetail, getNewsList } from "@/lib/microcms";
import type { Category } from "@/types";

type Props = { params: { id: string } };

function catLabel(c?: Category): string | null {
  if (!c) return null;
  return Array.isArray(c) ? c[0] || null : c;
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export async function generateStaticParams() {
  const news = await getNewsList();
  return news.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsDetail(params.id);
  if (!news) return { title: "お知らせ" };
  return { title: news.title, description: news.title };
}

export default async function NewsDetailPage({ params }: Props) {
  const news = await getNewsDetail(params.id);
  if (!news) notFound();
  const cat = catLabel(news.category);

  return (
    <main style={{ background: "#FFFFFF", padding: "clamp(56px,8vw,96px) clamp(20px,5vw,32px) clamp(72px,10vw,116px)" }}>
      <article style={{ maxWidth: 720, margin: "0 auto" }} className="dc-fadeup">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 14, letterSpacing: "0.08em", color: "#888" }}>{formatDate(news.publishedAt)}</span>
          {cat && (
            <span style={{ fontSize: 11, letterSpacing: "0.04em", color: "#1A2A40", border: "1px solid rgba(26,42,64,0.3)", padding: "4px 11px", borderRadius: 999 }}>{cat}</span>
          )}
        </div>
        <h1 style={{ margin: "20px 0 0", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.5, letterSpacing: "-0.005em" }}>
          {news.title}
        </h1>
        <div style={{ height: 1, background: "rgba(42,42,42,0.12)", margin: "clamp(32px,4vw,44px) 0" }} />
        <div className="rich-text" dangerouslySetInnerHTML={{ __html: news.body }} />
        <div style={{ marginTop: "clamp(40px,5vw,64px)", textAlign: "center" }}>
          <Link href="/news" className="dc-btn dc-btn-outline">← お知らせ一覧へ</Link>
        </div>
      </article>
    </main>
  );
}
