# Resend（フォーム送信）セットアップ手順

`/shooting` のお問い合わせフォームは、`/api/contact` → Resend 経由でメール送信します。
**ドメイン取得前でもテスト送信で動作確認**できます。下記の2フェーズで進めます。

---

## フェーズ1：ドメインなしでテスト送信（今すぐ）
Resend は検証用の共有送信元 `onboarding@resend.dev` を提供しており、
**自分のアカウント登録メール宛**にだけ送信できます。これで配線確認が可能。

### 手順
1. https://resend.com/ で登録（GitHub or メール）
2. ログイン後 **API Keys → Create API Key**（権限は `Sending access` でOK）→ 発行されたキーをコピー
3. `.env.local` に設定：
   ```
   RESEND_API_KEY=re_xxxxxxxx
   RESEND_FROM=onboarding@resend.dev
   CONTACT_EMAIL=（Resendに登録したあなたのメールアドレス）
   ```
   > フェーズ1では `CONTACT_EMAIL` は**Resend登録メールと同じ**にする必要あり（テスト制約）。
4. これで `/shooting` のフォームから実際にメールが届くか確認できる。

---

## フェーズ2：独自ドメインで本番運用（ドメイン取得後）
独自ドメインを取得したら、任意の宛先に・自社ドメイン送信元で送れるようになります。

### 手順
1. ドメインを取得（お名前.com / Cloudflare / Google Domains 等。サイト本体のURLにも使う）
2. Resend → **Domains → Add Domain** → ドメインを入力
3. 表示される **DNSレコード（SPF・DKIM、必要ならDMARC）** をドメインのDNSに登録
4. Resend上で **Verified** になるのを待つ（数分〜）
5. `.env.local` / Vercel の環境変数を本番値に更新：
   ```
   RESEND_FROM=noreply@<取得したドメイン>
   CONTACT_EMAIL=<受信したい問い合わせ用アドレス>
   NEXT_PUBLIC_SITE_URL=https://<取得したドメイン>
   ```

---

## 動作確認
```bash
npm run dev
```
`/shooting` のフォームを送信 → `/thanks` に遷移し、`CONTACT_EMAIL` にメールが届けば成功。
件名は「【Studio note】撮影依頼のお問い合わせ」。

### うまくいかないとき
- 500「送信設定が未完了です」→ `RESEND_API_KEY` / `RESEND_FROM` / `CONTACT_EMAIL` のどれかが未設定
- 届かない（フェーズ1）→ `CONTACT_EMAIL` が Resend 登録メールと違う
- 届かない（フェーズ2）→ ドメインが Verified になっていない / DNS未反映
