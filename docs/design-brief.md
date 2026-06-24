# Studio note — デザインブリーフ（Claude Design 連携用）

Claude Design で仕上げを進めるための全情報。デザイントークン・コンポーネント・構造・コピー・素材・現状をまとめる。

## 0. リンク
- 本番：https://studio-note-steel.vercel.app
- リポジトリ：https://github.com/naoki-kaneoya/studio-note （private）
- ローカル：`/Users/k.naoki/Studio サイト`（Next.js 14 App Router / TS / Tailwind v3.4）

## 1. プロジェクト概要
- 大阪・庄内の**完全遮光・白スタジオ「Studio note」**のレンタル＆撮影依頼サイト
- 主目的：レンタル予約獲得（予約は外部 **Upnow** へ送客／サイトに予約機能なし）
- サブ目的：法人向け撮影依頼
- 無人運営・連絡は公式LINE

## 2. デザイン方向（参考サイト）
- 目標水準：**rentalstudio-room01.com とほぼ同等**（最重視）
- 他参考：blendliving.net / anspiration.net
- 方向性：**明るい全面白基調・写真主体・余白たっぷり・欧文見出し＋和文・ミニマルで editorial**
- 暗い面（黒マット）は多用しない。ヒーローのみ写真上に上品なグラデでテキスト可読性を確保

## 3. デザイントークン
### 配色（Tailwind: `tailwind.config.ts`）
| 用途 | 名前 | HEX |
| --- | --- | --- |
| ベース白 | `base` | `#FFFFFF` |
| オフホワイト（リズム用背景） | `offwhite` | `#F7F6F4` |
| テキスト（チャコール・純黒不使用） | `ink` | `#2A2A2A` |
| アクセント（インクブルー・限定使用） | `accent` | `#1A2A40` |
| 黒マット（ヒーロー等の最小限） | `matte` | `#111111` |

### フォント
- 和文：Noto Sans JP（400/500/700、`next/font`、CSS変数 `--font-noto-sans-jp`）
- 欧文ラベル：Georgia系セリフ（`font-serif`、POINT番号などに使用）
- 本文 `font-feature-settings: "palt"`、見出し `tracking-tight`、本文 `leading-loose`

### レイアウト
- コンテンツ最大幅：`max-w-content`（72rem）／左右 `px-5 md:px-8`
- セクション縦余白：`py-20 md:py-28`（広め）
- モバイルファースト。スマホは下部固定の予約バー（`--booking-bar-height: 64px` 分の `padding-bottom`）

## 4. コンポーネント一覧（`/components`）
| コンポーネント | 役割 | 主な特徴 |
| --- | --- | --- |
| `Header` | ロゴ＋ナビ＋常時予約ボタン | スクロール追従、スマホはハンバーガー |
| `MobileBookingBar` | スマホ下部固定の予約ボタン | md未満で表示 |
| `Footer` | 全ページリンク・運営情報 | 明るい白基調・欧文サブラベル付き |
| `Hero` | トップFV | 写真全面＋下/左グラデ＋欧文eyebrow＋見出し＋CTA2つ |
| `Section` / `SectionHeading` | 共通セクション枠／見出し | `dark`/`muted` 背景切替、**eyebrow（欧文小見出し）** 対応 |
| `PointCard` | 3つの強み | `POINT 01` セリフ番号＋細い上罫線＋タグpill |
| `UseCaseTile` | 用途タイル | 4:5写真＋hoverズーム、明るい白 |
| `GalleryGrid` | ギャラリー | カテゴリ絞り込み・タップ拡大（lightbox） |
| `NewsList` | お知らせ一覧 | 日付＋タイトル、罫線区切り |
| `EquipmentList` | 機材 | 撮影機材/スタイリングの2セクション、有料バッジ |
| `PriceSummary` | 料金サマリ | `¥4,400〜` 強調 |
| `MapEmbed` | 地図 | Google Maps iframe |
| `ContactForm` | 撮影依頼フォーム | 必須/任意・ハニーポット・送信後 `/thanks` |
| `BookingButton` | 予約ボタン | 環境変数リンク・GA `booking_click` 計測・solid/outline |

## 5. ページ構成
- `/`（トップ）：Hero → Point(3) → Works(用途4) → Gallery → Price → Flow → About → News → Access
- `/studio`：スペック表 → 空間ギャラリー → 主要機材 → 利用ルール → アクセス
- `/equipment`：撮影機材／スタイリングの2セクション（CMS）
- `/price`：料金・オプション・利用にあたって
- `/gallery`：作例／空間フィルタ付きグリッド（CMS）
- `/shooting`：リード→対応領域3→出張対応→流れ4→フォーム
- `/news`・`/news/[id]`：お知らせ（CMS）
- `/noda`：野田小学校スタジオ＋閉館予告（2026/12/28）
- `/terms`：利用規約枠（キャンセルはUpnow参照）
- `/company`：運営者情報
- `/thanks`：送信完了
- 各ページ見出しに欧文 eyebrow（Studio / Equipment / Price / Gallery / Shooting / News / Company / Terms 等）

## 6. 主要コピー（抜粋）
- ヒーロー見出し：「思いどおりの光を、自分の手で。」／eyebrow `RENTAL STUDIO — OSAKA SHONAI`
- 強み：01 光をゼロから組める／02 駅30秒・エレベーター直結／03 物撮りから動画まで1部屋で
- 料金：1時間 ¥4,400〜（税込）／10:00–20:00／背景紙+¥2,200
- 住所：大阪府豊中市庄内西町3-1-5 サンパティオビル3階（庄内駅 徒歩1分）
- 運営：株式会社Cloud Illusion／株式会社ウツセバ
（全文は各ページ `app/**/page.tsx` 参照）

## 7. データ（microCMS）
- `news`：title / body(リッチ) / category(お知らせ/料金/設備) / publishedAt
- `gallery`：image / category(作例/空間) / caption / order
- `equipment`：name / modelNumber / category(撮影機材/スタイリング・その他) / image / isPaid / order
- セレクトは**配列**で返る（`inCategory()` で判定）

## 8. 画像素材（`/public`、すべて仮のAI生成）
- `hero-poster.jpg`（ヒーロー）
- `usecase-portrait.jpg` / `usecase-product.jpg` / `usecase-video.jpg` / `usecase-cosplay.jpg`
- 未配置：`hero.mp4`（ヒーロー動画）
- ギャラリー・機材画像はmicroCMSから（現状ギャラリーは空＝「準備中」表示）

## 9. 現状と仕上げ候補（Claude Designで磨く点）
- ✅ 全ページ実装・本番公開・microCMS連携・フォーム送信（テスト）まで完了
- ✅ ROOM01寄りの明るいリデザイン適用済み（Hero/Point/Works/Footer）
- 仕上げ候補：
  - セクション間リズム・余白の最終調整、見出しタイポの詰め
  - ギャラリー／機材の実写差し替え後のグリッド見え方
  - 微アニメーション（フェードイン等）、ホバー挙動
  - ヒーロー動画導入時のトーン調整
  - モバイル時の予約バー・余白の最終確認

## 10. Claude Design 連携手順
1. このセッションで **`/login`**（claude.ai ログイン＝デザイン権限付与）
2. 以降、`DesignSync` でローカルのコンポーネントを Claude Design プロジェクトへ**1コンポーネントずつ同期**
3. Claude Design 側で仕上げ → 確定したらコードへ反映（または Vercel の import-claude-design-from-url で取込）
