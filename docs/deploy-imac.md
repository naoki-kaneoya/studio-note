# iMac本体で予約サイトを稼働させる

今回の公開先はiMac本体。iMac上のNext.jsが、設定済みGoogle Apps Scriptへ空き照会と予約を送る。利用者は共有されたHTTPS URLを各自のスマホ・PCで開く。予約者の端末にはインストールや設定は不要。

外部との接続はTailscale Funnelを利用する。独自ドメインの購入やルーターのポート開放を行わず、iMacに割り当てられた `https://<iMacの名前>.<ネットワーク名>.ts.net/book` を共有する。実際のURLは公開スクリプトの成功ログで確認する。

このクラウド環境からiMacを直接操作する機能はない。以下の作業はiMacのターミナル、またはiMac上のCodexで実行する。Vercelへのログインは今回のiMac運用には不要。

## 1. iMacにファイルとNode.jsを用意する

1. [Node.jsの公式サイト](https://nodejs.org/)からmacOS用LTS版を導入する。設定スクリプトはNode.js 22または24に対応し、クラウドの検証は24で実施している。iMacのmacOSに対応するインストーラーを使用する。
2. [GitHubの作業ブランチ](https://github.com/naoki-kaneoya/studio-note/tree/codex/direct-calendar-booking)をiMacへ用意する。Gitを使う場合は以下を実行する。

   ```bash
   git clone --branch codex/direct-calendar-booking https://github.com/naoki-kaneoya/studio-note.git "$HOME/studio-note"
   cd "$HOME/studio-note"
   ```

   既にリポジトリがある場合はそのフォルダを利用し、既存の変更を残して今回のブランチを取得する。GitHubのDownload ZIPでもよい。展開したフォルダはホーム直下などに置く。Downloads・Desktop・Documentsのままだと、macOSのプライバシー制御で自動起動後の読み取りに失敗する場合がある。

## 2. Google接続の設定を移す

サイトのフォルダ直下に `.env.local` を置く。今回のクラウド環境では、同じGoogle接続を使う設定ファイルを既に作成し、実カレンダーの空き照会を確認済み。iMacへの移動は管理者だけがアクセスできる方法で行い、Gitや共有ドキュメントには追加しない。

移動できない場合は `.env.example` を `.env.local` へコピーし、以下を設定する。

| 変数 | 確認場所 |
| --- | --- |
| `GOOGLE_BOOKING_SCRIPT_URL` | Apps Scriptの「デプロイ → デプロイを管理」にあるウェブアプリの `/exec` URL |
| `GOOGLE_BOOKING_SECRET` | 同じApps Scriptの「プロジェクトの設定 → スクリプト プロパティ → BOOKING_BACKEND_SECRET」 |

新しい秘密値を作ると接続できなくなるため、設定済みの同じ値を使う。値をチャットへ貼らない。予約用のApps Scriptやカレンダーを作り直す必要はない。

`BOOKING_SITE_ORIGIN` は外部公開のスクリプトが実際のHTTPS URLで設定する。ほかの環境変数が既にある場合は保持する。利用者の端末にはこのファイルを配らない。

## 3. iMac上で起動する

ターミナルでサイトのフォルダから実行する。Finderから `scripts/macos/Setup.command` を開いても同じ処理を実行する。

```bash
bash scripts/macos/Setup.command
```

ロックファイルに従った `npm ci` と本番ビルドを行い、iMacのログイン後に自動起動するLaunchAgentを設定する。サーバーは127.0.0.1の3000番に限定する。設定済みのほかのサービスやルーターには手を加えない。

サーバーがクラッシュした場合は自動で再起動する。稼働中は `caffeinate -i` でアイドル状態の自動スリープを防ぐ。ディスプレイの消灯は可能。
再起動した後はiMacへのログインが必要。手動スリープ、ログアウト、電源オフ、ネットワーク切断中は予約サイトにアクセスできない。

## 4. ほかの端末から使えるHTTPS URLを発行する

1. [Tailscaleの公式macOS版](https://tailscale.com/download/mac)を導入し、iMacのアプリで管理者アカウントへログインする。iMacへのログイン後にTailscaleも起動する設定にする。
2. TailscaleのMagicDNSとHTTPS、Funnelを利用できる状態にする。初回公開時にCLIが設定用リンクを表示した場合は、そのリンクを管理者アカウントで開いて有効化する。[公式Funnel手順](https://tailscale.com/kb/1223/funnel)も参照できる。
3. サイトのフォルダから以下を実行する。Finderの `scripts/macos/Publish.command` でも同じ処理を実行する。

   ```bash
   bash scripts/macos/Publish.command
   ```

公開元とサイトURLを `.env.local` へ保存し、本番ビルドとサービスを更新してからFunnelを有効化する。Googleの秘密値はLaunchAgentや共有URLに含めない。Tailscaleの443番にほかの公開設定がある場合は上書きせず停止する。

成功したら `共有する予約URL: https://…/book` が表示される。通常の再起動では同じTailscale端末のDNS名を使用する。端末の削除・DNS名やネットワーク名の変更時はURLを確認し直す。

## 5. 外部から確認する

iMacと同じWi-Fiにつながっていないスマホなどで、発行されたURLを開く。庄内と野田小学校を切り替え、日付を選んで実カレンダーの空き時間が表示されることを確認する。
Tailscaleをインストールしていない予約者も、Funnelの共有URLからブラウザーで利用できる。

実予定の登録と招待配送はまだ検証していない。管理者が確認できるテスト日時・メールアドレスを指定してから試す。空き表示だけの確認で実予約を送る必要はない。

## 日常の起動・停止

```bash
node scripts/macos/service.mjs status
node scripts/macos/service.mjs stop
node scripts/macos/service.mjs start
```

更新はコードを取得した後、`Setup.command` を再実行する。ビルド中は予約ページが停止するため、更新する時間を決めて実施する。フォルダの移動やNode.jsの更新後も再実行する。
ログは `~/Library/Logs/StudioNote`、自動起動設定は `~/Library/LaunchAgents/jp.studionote.booking.plist` に保存する。Google接続の秘密値は自動起動ファイルに書かない。

現在の確認範囲はクラウドでの本番ビルド・予約API・LaunchAgentの生成内容。macOSのlaunchctl、自動起動、Funnel公開、iMac外の端末での動作は、iMac側で実行するまで未検証。
