import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import Hero from "@/components/Hero";
import PointCard from "@/components/PointCard";
import UseCaseTile from "@/components/UseCaseTile";
import GalleryGrid from "@/components/GalleryGrid";
import NewsList from "@/components/NewsList";
import PriceSummary from "@/components/PriceSummary";
import MapEmbed from "@/components/MapEmbed";
import BookingButton from "@/components/BookingButton";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { getGalleryList, getNewsList } from "@/lib/microcms";
import { SITE } from "@/lib/site";

const POINTS = [
  {
    no: "01",
    title: "光を、ゼロから組める",
    body: "外光を完全にシャットアウトした白スタジオ。NANLITEの定常光からGodoxのストロボ、ソフトボックスやアンブレラまでひと通り揃っているから、時間帯や天気に左右されず、思いどおりの光を自分で作れる。背景紙以外の機材はすべて無料。使い慣れた機材の持ち込みもOK。",
    stats: ["定常光・ストロボ完備", "背景紙以外 無料", "持ち込みOK"],
  },
  {
    no: "02",
    title: "駅30秒、エレベーター直結",
    body: "庄内駅西口から徒歩30秒、梅田から電車10分。エレベーターで3階まで直行できるから、三脚や照明機材の積み下ろしもスムーズ。重い機材を運ぶプロのリピーターが多いのは、この身軽さも理由。",
    stats: ["庄内駅 30秒", "梅田 10分", "エレベーター直結"],
  },
  {
    no: "03",
    title: "物撮りから動画まで、1部屋で",
    body: "40㎡・天井高2.7m・最大10名。テザー撮影用の40インチモニターとケーブル、メイクスペースや姿見も完備。物撮り・ポートレート・動画・コスプレまで、用途を選ばず1部屋で完結する。インボイスにも対応。",
    stats: ["40㎡", "天井高2.7m", "最大10名", "インボイス対応"],
  },
];

const USE_CASES = [
  {
    title: "ポートレート・アー写",
    body: "肌も髪も、狙った一灯で。モデル撮影・宣材・オーディション写真に。",
    image: "/usecase-portrait.jpg",
  },
  {
    title: "物撮り・EC",
    body: "テザー環境完備。40インチモニターで色と質感を確認しながら撮れる。",
    image: "/usecase-product.jpg",
  },
  {
    title: "動画・MV・PV",
    body: "完全遮光だから映り込みゼロ。インタビューからMVまで安定した画づくりを。",
    image: "/usecase-video.jpg",
  },
  {
    title: "コスプレ・推し活",
    body: "白背景を活かして世界観を自由に。セルフ前撮りにも。",
    image: "/usecase-cosplay.jpg",
  },
];

const STEPS = [
  "Upnowで空き状況を確認・予約",
  "予約後、入室方法とスタジオ初期状態をご案内",
  "当日は10:00–20:00の予約時間内に入室・撮影",
  "原状復帰・清掃のうえ施錠して退室",
];

export default async function HomePage() {
  const [gallery, news] = await Promise.all([
    getGalleryList(),
    getNewsList(3),
  ]);
  const galleryExcerpt = gallery.slice(0, 9);

  return (
    <>
      <LocalBusinessJsonLd />

      {/* 01 ヒーロー */}
      <Hero />

      {/* 02 3つの強み */}
      <Section>
        <SectionHeading
          eyebrow="Point"
          title="Studio note が選ばれている理由"
          lead="自然光は待つしかない。でも完全遮光なら、光は自分で組み立てられる。Studio note が選ばれている理由は3つ。"
        />
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
          {POINTS.map((p) => (
            <PointCard key={p.no} {...p} />
          ))}
        </div>
      </Section>

      {/* 03 完全遮光でできること */}
      <Section muted>
        <SectionHeading
          eyebrow="Works"
          title="完全遮光でできること"
          lead="光を自分で組めるから、用途を選ばない。Studio note の使われ方の一例。"
        />
        <div className="grid grid-cols-2 gap-5 md:gap-7 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <UseCaseTile key={u.title} {...u} />
          ))}
        </div>
      </Section>

      {/* 04 作例 */}
      <Section>
        <SectionHeading
          eyebrow="Gallery"
          title="作例"
          lead="実際にこのスタジオで撮影された一枚を。"
        />
        <GalleryGrid items={galleryExcerpt} filterable={false} />
        <div className="mt-8">
          <Link
            href="/gallery"
            className="text-sm font-bold text-accent underline underline-offset-4"
          >
            ギャラリーを見る →
          </Link>
        </div>
      </Section>

      {/* 05 料金 */}
      <Section muted>
        <SectionHeading eyebrow="Price" title="料金" />
        <PriceSummary />
        <div className="mt-7 flex flex-wrap gap-4">
          <Link
            href="/price"
            className="inline-flex items-center justify-center rounded-full border border-accent px-6 py-3 text-sm font-bold tracking-wide2 text-accent transition-colors hover:bg-accent hover:text-white"
          >
            料金の詳細
          </Link>
          <BookingButton location="top_price" />
        </div>
      </Section>

      {/* 06 ご予約の流れ */}
      <Section>
        <SectionHeading eyebrow="Flow" title="ご予約の流れ" />
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className="rounded-lg border border-ink/10 bg-offwhite p-5"
            >
              <span className="text-2xl font-bold text-accent">{i + 1}</span>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{s}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-ink/50">
          無人運営のため電話対応なし。連絡は公式LINEへ。
        </p>
        <div className="mt-7">
          <BookingButton location="top_flow" />
        </div>
      </Section>

      {/* 07 Studio note について */}
      <Section muted>
        <SectionHeading eyebrow="About" title="Studio note について" />
        <div className="max-w-3xl space-y-4 leading-relaxed text-ink/80">
          <p>
            「機材無料と書いてあるのにプロ仕様じゃない」——そんなストレスを解消したくて、運営2社のフォトグラファーが、プロに必要な機材を全部詰めて設計したスタジオです。完全遮光で光を自由に組める環境を、駅30秒の立地で。
          </p>
          <p>
            撮影そのもののご依頼も承っています。
            <Link
              href="/shooting"
              className="text-accent underline underline-offset-4"
            >
              撮影を依頼したい方へ
            </Link>
          </p>
          <p className="text-sm text-ink/60">
            運営：{SITE.operators.join("／")}
          </p>
        </div>
      </Section>

      {/* 08 お知らせ */}
      <Section>
        <SectionHeading eyebrow="News" title="お知らせ" />
        <NewsList items={news} />
        <div className="mt-8">
          <Link
            href="/news"
            className="text-sm font-bold text-accent underline underline-offset-4"
          >
            お知らせ一覧 →
          </Link>
        </div>
      </Section>

      {/* 09 アクセス */}
      <Section id="access" muted>
        <SectionHeading eyebrow="Access" title="アクセス" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed text-ink/80">
            <p>{SITE.address.postalLine}</p>
            <p>{SITE.address.access}</p>
            <p>搬入：エレベーターで3階直行／テナントビル内</p>
            <p>利用時間：{SITE.hours}</p>
            <div className="pt-3">
              <BookingButton location="top_access" />
            </div>
          </div>
          <MapEmbed />
        </div>
      </Section>
    </>
  );
}
