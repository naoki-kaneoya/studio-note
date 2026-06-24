import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/Section";
import GalleryGrid from "@/components/GalleryGrid";
import MapEmbed from "@/components/MapEmbed";
import BookingButton from "@/components/BookingButton";
import { getGalleryList } from "@/lib/microcms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "スタジオ詳細",
  description:
    "40㎡・天井高2.7m・最大10名。完全遮光・エレベーター3階直行・インボイス対応の白スタジオ。スペック・主要機材・利用ルール・アクセスをご案内します。",
};

const SPECS: [string, string][] = [
  ["広さ", "40㎡（約25畳）"],
  ["天井高", "2.7m"],
  ["定員", "最大10名"],
  ["利用時間", "10:00–20:00"],
  ["アクセス", "庄内駅徒歩1分・梅田から電車10分"],
  ["設備", "完全遮光・エレベーター3階直行・インボイス対応・Wi-Fi完備"],
];

const RULES = [
  "全面禁煙（電子タバコ含む）",
  "大音量・強い匂いの飲食物（カレー等）はNG",
  "無人運営のため電話対応なし。連絡は公式LINEへ",
  "退室時は原状復帰・床清掃・ゴミ持ち帰り（未実施は復帰・清掃料3万円）",
  "スタンド類は引きずらず持ち上げて移動（床材保護）",
  "防犯カメラ常時稼働",
];

export default async function StudioPage() {
  const spaceGallery = await getGalleryList("空間");

  return (
    <>
      {/* ① スペック */}
      <Section>
        <SectionHeading eyebrow="Studio" title="スタジオ詳細" />
        <dl className="grid gap-px overflow-hidden rounded-lg border border-ink/10 bg-ink/10 sm:grid-cols-2">
          {SPECS.map(([k, v]) => (
            <div key={k} className="flex gap-4 bg-base p-5">
              <dt className="w-24 shrink-0 text-sm font-bold text-accent">
                {k}
              </dt>
              <dd className="text-sm text-ink/80">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ② 空間ギャラリー */}
      <Section muted>
        <SectionHeading
          eyebrow="Space"
          title="空間ギャラリー"
          lead="白スタジオの全景・コーナー・着替え／メイクスペース。"
        />
        <GalleryGrid items={spaceGallery} filterable={false} />
      </Section>

      {/* ③ 主要機材（抜粋） */}
      <Section>
        <SectionHeading
          eyebrow="Equipment"
          title="主要機材（抜粋）"
          lead="定常光・ストロボからソフトボックス、テザー環境まで完備。背景紙以外の機材はすべて無料、持ち込みもOK。"
        />
        <ul className="space-y-2 text-sm text-ink/80">
          <li>・照明：NANLITE FS-300B ／ Godox DE300＋DP1000</li>
          <li>・撮影：40インチモニター＋テザーケーブル4.7m</li>
          <li>・スタイリング：女優ミラードレッサー／メイクワゴン／姿見</li>
        </ul>
        <div className="mt-7">
          <Link
            href="/equipment"
            className="text-sm font-bold text-accent underline underline-offset-4"
          >
            全機材リストを見る →
          </Link>
        </div>
      </Section>

      {/* ④ 利用ルール・注意事項 */}
      <Section muted>
        <SectionHeading
          eyebrow="Rules"
          title="利用ルール・注意事項"
          lead="テナントビル内のため、他テナント・近隣への配慮をお願いしています。"
        />
        <ul className="space-y-2 text-sm text-ink/80">
          {RULES.map((r) => (
            <li key={r}>・{r}</li>
          ))}
        </ul>
        <div className="mt-7">
          <Link
            href="/terms"
            className="text-sm font-bold text-accent underline underline-offset-4"
          >
            利用規約・キャンセルポリシー →
          </Link>
        </div>
      </Section>

      {/* ⑤ アクセス */}
      <Section id="access">
        <SectionHeading eyebrow="Access" title="アクセス" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed text-ink/80">
            <p>{SITE.address.postalLine}</p>
            <p>{SITE.address.access}</p>
            <div className="pt-3">
              <BookingButton location="studio_access" />
            </div>
          </div>
          <MapEmbed />
        </div>
      </Section>
    </>
  );
}
