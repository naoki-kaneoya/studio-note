# Vercel デプロイ手順（GitHub連携）

リポジトリ：https://github.com/naoki-kaneoya/studio-note

既存の本番プロジェクトがある場合は、そのプロジェクトを利用する。環境変数を登録してから今回のコードを本番へ反映する。

## 1. プロジェクトをImport
1. https://vercel.com/ にログイン（GitHubアカウントでログインすると連携が楽）
2. **Add New… → Project**
3. `naoki-kaneoya/studio-note` を **Import**
   - 初回は Vercel に GitHub リポジトリへのアクセス許可を求められる → 許可
4. Framework Preset は **Next.js** が自動検出される（変更不要）
5. Build/Output 設定もデフォルトでOK（`next build`）

## 2. 環境変数を登録（Import画面の Environment Variables）
予約サイトに必要な設定は、Vercelのプロジェクトに登録する。利用者のスマホやPCには何も設定しない。
既存プロジェクトの場合は **対象プロジェクト → Settings → Environment Variables** を開く。
Google Apps Scriptの準備は [booking-setup.md](booking-setup.md) を参照。

| Key | 値 | 必要な機能 |
| --- | --- | --- |
| `GOOGLE_BOOKING_SCRIPT_URL` | Apps ScriptをWebアプリとしてデプロイした `/exec` URL | 空き時間の表示と直接予約 |
| `GOOGLE_BOOKING_SECRET` | Apps Scriptの `BOOKING_BACKEND_SECRET` と同じ秘密値 | 空き時間の表示と直接予約 |

この2つはサーバー専用で、`NEXT_PUBLIC_` は付けない。Productionに設定し、検証環境にも必要ならPreviewに設定する。`BOOKING_ACCESS_CODE`は不要。
以下は既存サイトのその他の機能に応じて登録する。microCMSやResendの設定がなくても、Google接続が設定されていれば空き表示と直接予約は利用できる。

| Key | 現時点の値 | 備考 |
| --- | --- | --- |
| `MICROCMS_SERVICE_DOMAIN` | `studionote` | |
| `MICROCMS_API_KEY` | （GET権限のキー） | ※公開しないこと |
| `RESEND_API_KEY` | （`re_` のキー） | |
| `RESEND_FROM` | `onboarding@resend.dev` | ドメイン取得後 `noreply@<ドメイン>` に変更 |
| `CONTACT_EMAIL` | `kaneoya.naoki@gmail.com` | ドメイン認証後に本来の受信先へ変更 |
| `NEXT_PUBLIC_UPNOW_STUDIO_URL` | `https://upnow.jp/note/Studio-note` | |
| `NEXT_PUBLIC_UPNOW_NODA_URL` | `https://upnow.jp/note/noda` | |
| `NEXT_PUBLIC_SITE_URL` | `https://studio-note.vercel.app` | 確定後、独自ドメインに変更 |
| `NEXT_PUBLIC_GA_ID` | （空でOK） | スタジオ専用GAの測定IDを後で設定 |

> `NEXT_PUBLIC_SITE_URL` は最初Vercelの割当URL（`https://<プロジェクト名>.vercel.app`）でOK。
> 正確なURLはデプロイ後に確認して設定し直す。

## 3. Deploy
- **Deploy** を押す → ビルド〜公開（数分）
- 完了後、`https://<プロジェクト名>.vercel.app` で全ページ表示を確認
- `https://<プロジェクト名>.vercel.app/book` で空き状況と予約を確認する。公開URLはVercelが実際に割り当てたものを使う。

## 4. デプロイ後チェック
- [ ] 全ページ表示（トップ/studio/equipment/price/gallery/shooting/news/noda/terms/company）
- [ ] 機材・お知らせがmicroCMSの実データで表示される
- [ ] 直接予約ボタンが `/book`、一般予約ボタンがUpnowに遷移する
- [ ] `/book` で施設ごとの空き時間を表示し、空き枠から利用時間を選択できる
- [ ] テスト用カレンダー・管理者のテスト用アドレスで予定登録と招待の到着を確認する
- [ ] スマホからも施設・日付・時間を選んで予約できる
- [ ] `/shooting` フォーム送信 → `/thanks` 遷移 → `kaneoya.naoki@gmail.com` に着信
- [ ] `https://<project>.vercel.app/sitemap.xml` `/robots.txt` が出る
- [ ] `NEXT_PUBLIC_SITE_URL` を実URLに更新して再デプロイ

## 5. 以降の運用
- `main` ブランチに push すると自動で本番デプロイ
- 環境変数を変えたら **Settings → Environment Variables** で更新し、再デプロイ
- 利用者には `https://<公開先ドメイン>/book` を共有する。Google接続の秘密値は共有しない
- microCMSのコンテンツ更新は最大1時間で反映（ISR revalidate:3600）。即時反映したい場合はVercelで再デプロイ

## 6. 独自ドメイン取得後
1. Vercel: **Settings → Domains** で独自ドメインを追加し、表示されるDNSを設定
2. Resend: ドメイン認証（SPF/DKIM）→ `RESEND_FROM` を `noreply@<ドメイン>` に
3. `CONTACT_EMAIL` を本来の受信先に変更
4. `NEXT_PUBLIC_SITE_URL` を `https://<独自ドメイン>` に変更 → 再デプロイ
5. Google Search Console にドメイン登録・`sitemap.xml` 送信
