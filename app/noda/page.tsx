import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/Section";
import BookingButton from "@/components/BookingButton";
import { UPNOW_NODA_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "野田小学校スタジオ",
  description:
    "廃校の教室をそのまま活かしたスタジオ。コスプレ・ポートレート向け。庄内駅徒歩5分。",
};

export default function NodaPage() {
  return (
    <>
      <Section>
        <SectionHeading
          title="野田小学校スタジオ"
          lead="廃校の教室をそのまま活かした、ノスタルジックな撮影空間。コスプレ・ポートレート撮影に。"
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-sm leading-relaxed text-ink/80">
            <div>
              <h3 className="font-bold text-accent">施設の特徴</h3>
              <p className="mt-2">
                廃校・教室スタジオ。黒板・机・窓際の自然光を活かした世界観で、コスプレ・ポートレート撮影に向いています。
              </p>
            </div>
            <div>
              <h3 className="font-bold text-accent">アクセス</h3>
              <p className="mt-2">庄内駅 徒歩5分</p>
            </div>
            <div className="pt-2">
              <BookingButton href={UPNOW_NODA_URL} location="noda" />
            </div>
          </div>

          <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-offwhite text-xs text-ink/40">
            施設写真を準備中
          </div>
        </div>
      </Section>

      {/* 閉館予告（控えめに1ブロック） */}
      <Section className="bg-offwhite">
        <div className="rounded-lg border border-ink/10 bg-base p-6 text-sm leading-relaxed text-ink/70">
          <p className="font-bold text-ink">営業終了のお知らせ</p>
          <p className="mt-2">
            野田小学校スタジオは、2026年12月28日をもって営業を終了いたします。これまでのご利用に心より感謝申し上げます。営業終了まで通常どおりご予約いただけます。
          </p>
        </div>
      </Section>
    </>
  );
}
