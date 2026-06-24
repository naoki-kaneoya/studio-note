import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/Section";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "撮影を依頼したい方へ",
  description:
    "Studio note を運営する撮影チームが、商品撮影から映像まで事業者さまの撮影を承ります。スタジオ撮影・出張撮影どちらにも対応。お問い合わせはこちら。",
};

const AREAS = [
  {
    title: "商品・物撮り",
    body: "EC・カタログ・LP用の商品撮影。テザー環境で色と質感を確認しながら撮影。",
  },
  {
    title: "ポートレート・宣材",
    body: "採用・コーポレートサイト・タレント/モデルの宣材、アー写撮影。",
  },
  {
    title: "映像制作",
    body: "商業・採用・サービス紹介などの映像。企画から撮影・編集まで対応。",
  },
];

const FLOW = [
  "フォームよりお問い合わせ",
  "内容・ご予算をヒアリング",
  "お見積もり・ご提案",
  "撮影・納品",
];

export default function ShootingPage() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Shooting"
          title="撮影を依頼したい方へ"
          lead="Studio note を運営する撮影チームが、商品撮影から映像まで、事業者さまの撮影を承っています。完全遮光のスタジオ環境を活かした物撮りから、ロケを含む映像制作まで対応。スタジオ撮影・出張撮影どちらにも対応します。"
        />

        <div className="grid gap-5 md:grid-cols-3">
          {AREAS.map((a) => (
            <article
              key={a.title}
              className="rounded-lg border border-ink/10 bg-offwhite p-6"
            >
              <h3 className="font-bold text-accent">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {a.body}
              </p>
              <p className="mt-4 rounded bg-ink/5 px-3 py-2 text-xs text-ink/50">
                制作事例は準備中
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-offwhite p-6">
          <h3 className="font-bold text-accent">スタジオ撮影／出張撮影に対応</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            庄内のスタジオでの撮影はもちろん、貴社オフィス・店舗・ロケ地への出張撮影も承ります。
          </p>
        </div>

        <div className="mt-12">
          <h3 className="font-bold text-accent">ご依頼の流れ</h3>
          <ol className="mt-4 grid gap-4 md:grid-cols-4">
            {FLOW.map((f, i) => (
              <li
                key={i}
                className="rounded-lg border border-ink/10 p-5"
              >
                <span className="text-2xl font-bold text-accent">{i + 1}</span>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{f}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="Contact" title="お問い合わせフォーム" />
        <div className="max-w-3xl">
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
