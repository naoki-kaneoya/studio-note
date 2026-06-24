import Link from "next/link";
import type { News } from "@/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function NewsList({ items }: { items: News[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink/50">現在お知らせはありません。</p>
    );
  }
  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((n) => (
        <li key={n.id}>
          <Link
            href={`/news/${n.id}`}
            className="flex flex-col gap-1 py-5 transition-colors hover:text-accent sm:flex-row sm:items-baseline sm:gap-6"
          >
            <time className="shrink-0 text-sm tabular-nums text-ink/50">
              {formatDate(n.publishedAt)}
            </time>
            <span className="font-medium">{n.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
