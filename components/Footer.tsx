import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 bg-matte text-white/80">
      <div className="mx-auto max-w-content px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-xl font-bold tracking-wide2 text-white">
              Studio note
            </p>
            <p className="mt-4 text-sm leading-relaxed">
              {SITE.address.postalLine}
              <br />
              {SITE.address.access} ／ 利用時間 {SITE.hours}
            </p>
            <p className="mt-4 text-xs text-white/60">
              運営：{SITE.operators.join("／")}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-2 text-sm">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-1 text-white/80 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            他プラットフォームでもご予約いただけます（スペースマーケット等）。
          </p>
          <p>© {SITE.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
