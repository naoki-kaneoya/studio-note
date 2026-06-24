import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-base text-ink">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xl font-bold tracking-wide2">Studio note</p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-ink/40">
              Rental Studio — Osaka Shonai
            </p>
            <p className="mt-6 text-sm leading-loose text-ink/70">
              {SITE.address.postalLine}
              <br />
              {SITE.address.access} ／ 利用時間 {SITE.hours}
            </p>
            <p className="mt-4 text-xs text-ink/50">
              運営：{SITE.operators.join("／")}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-1.5 text-ink/70 transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ink/10 pt-6 text-xs text-ink/45 sm:flex-row sm:items-center sm:justify-between">
          <p>他プラットフォームでもご予約いただけます（スペースマーケット等）。</p>
          <p>© {SITE.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
