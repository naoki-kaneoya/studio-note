/**
 * サイト共通の定数。予約リンクは環境変数で一元管理し、直書きしない。
 */

export const SITE = {
  name: "Studio note",
  description:
    "外光ゼロの完全遮光・白スタジオ。NANLITE・Godoxのプロ機材を自由に組んで、時間に縛られず光をつくれるレンタルスタジオ。庄内駅30秒・梅田10分。",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  address: {
    postalLine: "大阪府豊中市庄内西町3-1-5 サンパティオビル3階",
    region: "大阪府",
    locality: "豊中市",
    street: "庄内西町3-1-5 サンパティオビル3階",
    access: "阪急宝塚本線 庄内駅 徒歩1分",
  },
  hours: "10:00–20:00",
  priceFrom: "¥4,400",
  operators: ["株式会社Cloud Illusion", "株式会社ウツセバ"],
} as const;

/** Upnow 予約リンク（環境変数経由・フォールバック付き） */
export const UPNOW_STUDIO_URL =
  process.env.NEXT_PUBLIC_UPNOW_STUDIO_URL || "https://upnow.jp/note/Studio-note";
export const UPNOW_NODA_URL =
  process.env.NEXT_PUBLIC_UPNOW_NODA_URL || "https://upnow.jp/note/noda";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/** ヘッダー／メニューのナビゲーション（欧文＋和文） */
export const NAV_LINKS = [
  { href: "/studio", en: "Studio", ja: "スタジオ" },
  { href: "/equipment", en: "Equipment", ja: "機材" },
  { href: "/gallery", en: "Gallery", ja: "ギャラリー" },
  { href: "/price", en: "Price", ja: "料金" },
  { href: "/shooting", en: "Shooting", ja: "撮影依頼" },
  { href: "/news", en: "News", ja: "お知らせ" },
] as const;

export const FOOTER_LINKS = [
  { href: "/studio", label: "スタジオ詳細" },
  { href: "/equipment", label: "機材" },
  { href: "/price", label: "料金" },
  { href: "/gallery", label: "ギャラリー" },
  { href: "/shooting", label: "撮影を依頼したい方へ" },
  { href: "/news", label: "お知らせ" },
  { href: "/noda", label: "野田小学校" },
  { href: "/terms", label: "利用規約・キャンセルポリシー" },
  { href: "/company", label: "運営者情報" },
] as const;
