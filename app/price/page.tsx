import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import PriceSummary from "@/components/PriceSummary";
import BookingButton from "@/components/BookingButton";

export const metadata: Metadata = {
  title: "料金",
  description:
    "1時間 ¥4,400〜（税込）。利用時間10:00–20:00。平日・土日祝で料金が変わります。最新の空き状況と確定価格はUpnowでご確認ください。",
};

export default function PricePage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Price"
        title="料金"
        lead="1時間 ¥4,400〜（税込）／利用時間 10:00–20:00。平日・土日祝で料金が変わります。最新の空き状況と確定価格はUpnowでご確認ください。"
      />

      <PriceSummary />

      <div className="mt-10 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-accent">オプション</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>
              ・背景紙1本（セルフ設置・撤去）＋¥2,200／設置動画あり
            </li>
            <li>・撤去未実施は復帰料3万円</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-accent">ご利用にあたって</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>・原状復帰・清掃・ゴミ持ち帰りをお願いします</li>
            <li>
              ・キャンセルポリシー全文は
              <Link
                href="/terms"
                className="text-accent underline underline-offset-4"
              >
                こちら
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <BookingButton location="price" />
      </div>
    </Section>
  );
}
