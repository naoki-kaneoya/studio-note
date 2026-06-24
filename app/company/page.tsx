import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/Section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "Studio note の運営者情報。",
};

export default function CompanyPage() {
  return (
    <Section>
      <SectionHeading title="運営者情報" />
      <dl className="max-w-2xl space-y-px overflow-hidden rounded-lg border border-ink/10 bg-ink/10">
        <div className="flex flex-col gap-1 bg-base p-5 sm:flex-row sm:gap-6">
          <dt className="w-28 shrink-0 text-sm font-bold text-accent">
            運営
          </dt>
          <dd className="text-sm text-ink/80">
            {SITE.operators.map((o) => (
              <p key={o}>{o}</p>
            ))}
          </dd>
        </div>
        <div className="flex flex-col gap-1 bg-base p-5 sm:flex-row sm:gap-6">
          <dt className="w-28 shrink-0 text-sm font-bold text-accent">
            所在地
          </dt>
          <dd className="text-sm text-ink/80">{SITE.address.postalLine}</dd>
        </div>
        <div className="flex flex-col gap-1 bg-base p-5 sm:flex-row sm:gap-6">
          <dt className="w-28 shrink-0 text-sm font-bold text-accent">
            お問い合わせ
          </dt>
          <dd className="text-sm text-ink/80">公式LINE</dd>
        </div>
      </dl>
    </Section>
  );
}
