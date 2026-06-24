import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "お問い合わせありがとうございます",
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl py-10 text-center">
        <h1 className="text-2xl font-bold text-accent md:text-3xl">
          お問い合わせありがとうございます。
        </h1>
        <p className="mt-6 leading-relaxed text-ink/80">
          内容を確認のうえ、担当者よりご連絡いたします。
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-accent px-8 py-3 text-sm font-bold tracking-wide2 text-accent transition-colors hover:bg-accent hover:text-white"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </Section>
  );
}
