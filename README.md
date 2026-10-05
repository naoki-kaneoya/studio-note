# Studio note サイト

完全遮光・白スタジオ「Studio note」（大阪・庄内）のレンタル＆撮影依頼サイト。
一般の予約は外部サービス **Upnow** へ送客する。
Studio note（庄内）と野田小学校には、豊中ベンチャーと関連グループ向けの直接予約フォーム（`/book`）を用意。
Googleカレンダーの空き時間を表示し、選んだ時間で予約を登録して、入力されたメールアドレスへカレンダー招待を送る。
公開したサイトを各自のスマホやPCから利用する。利用者の端末には設定やインストールは不要。

## 技術スタック
- Next.js 14.2.35（App Router）+ TypeScript
- Tailwind CSS v3.4（デザイントークンは `tailwind.config.ts`）
- microCMS（`microcms-js-sdk`）
- Resend（フォーム送信）
- Vercel ホスティング前提

## 開発者向けセットアップ
```bash
npm ci
cp .env.example .env.local   # 値を埋める
npm run dev                  # http://localhost:3000
```

## 環境変数（`.env.local`）
| 変数 | 用途 |
| --- | --- |
| `MICROCMS_SERVICE_DOMAIN` | microCMS サービスドメイン |
| `MICROCMS_API_KEY` | microCMS APIキー |
| `RESEND_API_KEY` | Resend APIキー |
| `RESEND_FROM` | 送信元アドレス（独自ドメイン認証後に設定。例 `noreply@<domain>`） |
| `CONTACT_EMAIL` | 問い合わせ受信先 |
| `NEXT_PUBLIC_UPNOW_STUDIO_URL` | スタジオ予約リンク |
| `NEXT_PUBLIC_UPNOW_NODA_URL` | 野田小学校予約リンク |
| `NEXT_PUBLIC_SITE_URL` | 本番URL（sitemap/構造化データ用） |
| `NEXT_PUBLIC_GA_ID` | GA4 測定ID |
| `GOOGLE_BOOKING_SCRIPT_URL` | 空き表示・直接予約用のApps Script Webアプリの `/exec` URL |
| `GOOGLE_BOOKING_SECRET` | Apps Scriptの `BOOKING_BACKEND_SECRET` と同じサーバー間通信の秘密値 |

> 環境変数が未設定でもビルド・表示は壊れない設計（CMSは空配列、フォームは設定未完了エラーを返す）。

## 直接予約

`/book` で施設と日付を選ぶと、その日の空き時間と予約済み時間を確認できる。空き時間を選んで利用時間を調整し、名前とメールアドレスを入力して予約する。空き状況は1分ごとに更新し、手動でも更新できる。
予約URLの共有だけで利用でき、ログインや合言葉は不要。予定の件名・予約者の個人情報は空き画面に表示しない。
Google Apps Script側で予約を順番に処理し、施設ごとの既存の共通Googleカレンダーに重なる予定があれば受け付けない。別の施設同士は同じ時間にも予約可能。
通信エラー後は入力内容を固定し、同じ送信IDで「予約結果を再確認する」。登録済みで表示上の空き枠が消えても再確認でき、予定と招待は重複作成しない。

接続先が未設定の場合はフォームに「予約受付の準備中」と表示し、登録は行わない。
接続手順と外部予約サイトとの同期条件は [docs/booking-setup.md](docs/booking-setup.md) を参照。
公開時の環境変数はVercelの **対象プロジェクト → Settings → Environment Variables** に登録し、再デプロイする。Codexのクラウド環境の設定とは別。公開手順は [docs/deploy-vercel.md](docs/deploy-vercel.md) を参照。

```bash
npm test                     # Node.js 24: 日時・重複・再送・ロックの検証
npm run lint
npx tsc --noEmit
npm run build               # Google Fontsの取得に外部通信が必要
```

## microCMS スキーマ（リスト形式 API 3つ）

### `news`（お知らせ）
- `title` テキスト
- `body` リッチエディタ
- `category` セレクト（お知らせ / 料金 / 設備）※任意
- `publishedAt`（microCMS標準）

### `gallery`（ギャラリー）
- `image` 画像
- `category` セレクト（作例 / 空間）
- `caption` テキスト ※任意
- `order` 数値 ※任意（昇順表示）

### `equipment`（機材）
- `name` テキスト
- `modelNumber` テキスト ※任意
- `category` セレクト（撮影機材 / スタイリング・その他）
- `image` 画像 ※任意
- `isPaid` 真偽値（有料オプションは true）
- `order` 数値（昇順表示）

## 静的アセット（`/public`）
仮のプレースホルダ画像を配置済み（AI生成）。実素材が用意でき次第、同じファイル名で差し替える。
- `hero-poster.jpg` … ヒーローのポスター画像（仮）
- `usecase-portrait.jpg` / `usecase-product.jpg` / `usecase-video.jpg` / `usecase-cosplay.jpg` … トップ用途タイル（仮）
- `hero.mp4` … ヒーロー動画（**未配置**。圧縮済み・数MB台で配置。無くてもポスター画像で表示は成立）

### 差し替え時の推奨スペック
- ヒーロー動画 `hero.mp4`：1920×1080、10〜20秒ループ、H.264、数MB台（〜5MB目安）、音声なし
- ヒーローポスター `hero-poster.jpg`：1920×1080程度、JPEG quality 80前後、〜200KB
- 用途タイル：4:3（例 1200×900）、JPEG quality 80前後

## 計測（GA4）
- `booking_click` … 予約ボタンのクリック（`location` で設置場所を区別）
- `contact_submit` … フォーム送信成功

## デプロイ（Vercel）
1. GitHub リポジトリ連携
2. 環境変数を Vercel に登録
3. 独自ドメイン取得・追加・DNS設定（Resend の from 用ドメイン認証 = SPF/DKIM も）
4. 本番ビルド確認
5. Google Search Console にドメイン登録・`sitemap.xml` 送信
6. GA4 タグ＆イベント計測の動作確認

## 残タスク（運営側で用意）
- ヒーロー動画＋ポスター、各ページの写真素材
- microCMS アカウント＋初期データ入力（機材・ギャラリー・お知らせ）
- 独自ドメイン＋受信用メール＋Resend ドメイン認証
- Resend / GA4 のアカウント・キー
- `/terms` 本文（現状は枠のみ。キャンセルは Upnow 参照）
