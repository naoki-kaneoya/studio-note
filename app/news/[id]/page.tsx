import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/Section";
import { getNewsDetail, getNewsList } from "@/lib/microcms";

type Props = { params: { id: string } };

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export async function generateStaticParams() {
  const news = await getNewsList();
  return news.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsDetail(params.id);
  if (!news) return { title: "お知らせ" };
  return {
    title: news.title,
    description: news.title,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const news = await getNewsDetail(params.id);
  if (!news) notFound();

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <time className="text-sm tabular-nums text-ink/50">
          {formatDate(news.publishedAt)}
        </time>
        <h1 className="mt-2 text-2xl font-bold leading-snug md:text-3xl">
          {news.title}
        </h1>
        <div
          className="rich-text mt-8 text-ink/80"
          dangerouslySetInnerHTML={{ __html: news.body }}
        />
        <div className="mt-12 border-t border-ink/10 pt-6">
          <Link
            href="/news"
            className="text-sm font-bold text-accent underline underline-offset-4"
          >
            ← お知らせ一覧へ
          </Link>
        </div>
      </article>
    </Section>
  );
}
