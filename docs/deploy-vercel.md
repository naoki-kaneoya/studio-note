# Vercel デプロイ手順（GitHub連携）

リポジトリ：https://github.com/naoki-kaneoya/studio-note （private）

## 1. プロジェクトをImport
1. https://vercel.com/ にログイン（GitHubアカウントでログインすると連携が楽）
2. **Add New… → Project**
3. `naoki-kaneoya/studio-note` を **Import**
   - 初回は Vercel に GitHub リポジトリへのアクセス許可を求められる → 許可
4. Framework Preset は **Next.js** が自動検出される（変更不要）
5. Build/Output 設定もデフォルトでOK（`next build`）

## 2. 環境変数を登録（Import画面の Environment Variables）
以下をすべて登録する。**現時点の値**で入れてOK（ドメイン取得後に一部更新）。

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

## 4. デプロイ後チェック
- [ ] 全ページ表示（トップ/studio/equipment/price/gallery/shooting/news/noda/terms/company）
- [ ] 機材・お知らせがmicroCMSの実データで表示される
- [ ] 予約ボタンがUpnowに遷移する
- [ ] `/shooting` フォーム送信 → `/thanks` 遷移 → `kaneoya.naoki@gmail.com` に着信
- [ ] `https://<project>.vercel.app/sitemap.xml` `/robots.txt` が出る
- [ ] `NEXT_PUBLIC_SITE_URL` を実URLに更新して再デプロイ

## 5. 以降の運用
- `main` ブランチに push すると自動で本番デプロイ
- 環境変数を変えたら **Settings → Environment Variables** で更新し、再デプロイ
- microCMSのコンテンツ更新は最大1時間で反映（ISR revalidate:3600）。即時反映したい場合はVercelで再デプロイ

## 6. 独自ドメイン取得後
1. Vercel: **Settings → Domains** で独自ドメインを追加し、表示されるDNSを設定
2. Resend: ドメイン認証（SPF/DKIM）→ `RESEND_FROM` を `noreply@<ドメイン>` に
3. `CONTACT_EMAIL` を本来の受信先に変更
4. `NEXT_PUBLIC_SITE_URL` を `https://<独自ドメイン>` に変更 → 再デプロイ
5. Google Search Console にドメイン登録・`sitemap.xml` 送信
