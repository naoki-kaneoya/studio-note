import { existsSync, mkdirSync, chmodSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const label = "jp.studionote.booking";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const agent = path.join(homedir(), "Library/LaunchAgents", `${label}.plist`);
const logs = path.join(homedir(), "Library/Logs/StudioNote");
const port = 3000;
const marker = "Managed by studio-note scripts/macos/service.mjs";
class SetupError extends Error {}

const escapeXml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
export function createLaunchAgent({ directory = root, node = process.execPath, logDirectory = logs } = {}) {
  const args = ["/usr/bin/caffeinate", "-i", node, path.join(directory, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<!-- ${marker} -->
<key>Label</key><string>${label}</string>
<key>ProgramArguments</key><array>${args.map((value) => `<string>${escapeXml(value)}</string>`).join("")}</array>
<key>WorkingDirectory</key><string>${escapeXml(directory)}</string>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>10</integer>
<key>EnvironmentVariables</key><dict>
<key>PATH</key><string>${escapeXml(`${path.dirname(node)}:/usr/bin:/bin:/usr/sbin:/sbin`)}</string>
<key>NODE_ENV</key><string>production</string>
<key>NEXT_TELEMETRY_DISABLED</key><string>1</string>
</dict>
<key>StandardOutPath</key><string>${escapeXml(path.join(logDirectory, "server.log"))}</string>
<key>StandardErrorPath</key><string>${escapeXml(path.join(logDirectory, "server-error.log"))}</string>
</dict></plist>
`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", ...options });
  if (result.error || result.status !== 0) throw new SetupError(`${path.basename(command)} の実行に失敗しました。`);
  return result;
}

function stop() {
  const service = `gui/${process.getuid()}/${label}`;
  const present = spawnSync("/bin/launchctl", ["print", service], { stdio: "ignore" });
  if (present.status === 0) run("/bin/launchctl", ["bootout", service]);
}

function ensureOwnedAgent() {
  if (existsSync(agent) && !readFileSync(agent, "utf8").includes(marker)) {
    throw new SetupError("同じ名前の自動起動設定が既にあります。既存設定を保持するため停止しました。");
  }
}

function checkSettings() {
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) throw new SetupError("リポジトリ直下にGoogle接続設定の .env.local を置いてください。設定方法はdocs/deploy-imac.mdを参照してください。");
  chmodSync(file, 0o600);
  const require = createRequire(path.join(root, "package.json"));
  require("@next/env").loadEnvConfig(root, false, { info() {}, error() {} });
  const url = process.env.GOOGLE_BOOKING_SCRIPT_URL;
  const secret = process.env.GOOGLE_BOOKING_SECRET;
  if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || !secret || secret.length < 32) {
    throw new SetupError("Google接続のURLと秘密値を確認してください。値はログに表示しません。");
  }
  if (process.env.BOOKING_SITE_ORIGIN) {
    const origin = new URL(process.env.BOOKING_SITE_ORIGIN);
    if (origin.protocol !== "https:" || origin.origin !== process.env.BOOKING_SITE_ORIGIN) {
      throw new SetupError("BOOKING_SITE_ORIGINには末尾の / を除いたHTTPSの公開元を設定してください。");
    }
  }
}

async function checkPort() {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () => reject(new SetupError("3000番ポートが使われています。既存サービスを確認してから実行してください。")));
    server.listen(port, "127.0.0.1", () => server.close(resolve));
  });
}

async function ready() {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/book`, { signal: AbortSignal.timeout(2000) });
      if (response.ok && (await response.text()).includes("施設を予約する")) return;
    } catch { /* 起動中は再確認する */ }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new SetupError("予約ページの起動を確認できませんでした。~/Library/Logs/StudioNote を確認してください。");
}

function tailscaleJson(cli, args) {
  const result = spawnSync(cli, args, { encoding: "utf8", timeout: 15000 });
  if (result.error || result.status !== 0) throw new SetupError("Tailscaleアプリを起動してログインし、もう一度実行してください。");
  try { return JSON.parse(result.stdout) || {}; }
  catch { throw new SetupError("Tailscaleの状態を確認できませんでした。アプリの接続状態を確認してください。"); }
}

async function publish() {
  checkSettings();
  const cli = ["/Applications/Tailscale.app/Contents/MacOS/Tailscale", "/opt/homebrew/bin/tailscale", "/usr/local/bin/tailscale"].find(existsSync);
  if (!cli) throw new SetupError("https://tailscale.com/download/mac からTailscaleを導入し、アプリでログインしてください。");
  const status = tailscaleJson(cli, ["status", "--json"]);
  const hostname = status.Self?.DNSName?.replace(/\.$/, "").toLowerCase();
  if (status.BackendState !== "Running" || !hostname || !/^[a-z0-9-]+\.[a-z0-9.-]+\.ts\.net$/i.test(hostname)) {
    throw new SetupError("TailscaleへのログインとMagicDNSの設定を確認してください。");
  }
  const config = tailscaleJson(cli, ["serve", "status", "--json"]);
  const publicHandlers = config.Web?.[`${hostname}:443`]?.Handlers;
  const used443 = config.TCP?.["443"] || Object.keys(config.Web || {}).some((key) => key.endsWith(":443"));
  const alreadyOurs = config.TCP?.["443"]?.HTTPS === true && publicHandlers?.["/"]?.Proxy === "http://127.0.0.1:3000" && Object.keys(publicHandlers).length === 1;
  if ((used443 && !alreadyOurs) || Object.values(config.Foreground || {}).some((item) => item.TCP?.["443"])) {
    throw new SetupError("Tailscaleの443番に既存の公開設定があります。既存サービスを保持するため変更を止めました。");
  }
  const origin = `https://${hostname}`;
  const file = path.join(root, ".env.local");
  const current = readFileSync(file, "utf8");
  const retained = current.split(/\r?\n/).filter((line) => !/^\s*(?:export\s+)?(?:BOOKING_SITE_ORIGIN|NEXT_PUBLIC_SITE_URL)\s*=/.test(line)).join("\n").replace(/\n*$/, "");
  const temporary = path.join(root, ".env.studio-note-tmp.local");
  writeFileSync(temporary, `${retained}\nBOOKING_SITE_ORIGIN=${origin}\nNEXT_PUBLIC_SITE_URL=${origin}\n`, { mode: 0o600, flag: "wx" });
  renameSync(temporary, file);
  run(process.execPath, [fileURLToPath(import.meta.url), "setup"], { env: { ...process.env, BOOKING_SITE_ORIGIN: origin, NEXT_PUBLIC_SITE_URL: origin } });
  // ほかのServe/Funnel設定をresetしない。443番の専用設定だけを追加する。
  run(cli, ["funnel", "--bg", "--https=443", "http://127.0.0.1:3000"]);
  const published = tailscaleJson(cli, ["serve", "status", "--json"]);
  if (published.AllowFunnel?.[`${hostname}:443`] !== true || published.Web?.[`${hostname}:443`]?.Handlers?.["/"]?.Proxy !== "http://127.0.0.1:3000") {
    throw new SetupError("Funnelの公開設定を確認できませんでした。Tailscaleのfunnel statusを確認してください。");
  }
  console.log(`共有する予約URL: ${origin}/book`);
  console.log("iMacのWi-Fiを使っていない端末から、両施設の空き表示を確認してからグループに共有してください。");
}

async function main() {
  const command = process.argv[2] || "status";
  if (command === "plan") { process.stdout.write(createLaunchAgent()); return; }
  if (process.platform !== "darwin") throw new SetupError("この設定はiMac（macOS）で実行してください。クラウド環境にはインストールしません。");
  if (![22, 24].includes(Number(process.versions.node.split(".")[0]))) throw new SetupError("Node.js 22または24を使用してください。クラウドでは24で検証しています。");
  process.chdir(root);
  ensureOwnedAgent();
  if (command === "publish") { await publish(); return; }
  if (command === "stop") { stop(); console.log("Studio noteの自動起動サービスを停止しました。"); return; }
  if (command === "status") {
    const result = spawnSync("/bin/launchctl", ["print", `gui/${process.getuid()}/${label}`], { stdio: "ignore" });
    if (result.status !== 0) throw new SetupError("自動起動サービスは起動していません。");
    await ready(); console.log("自動起動サービスと予約ページの表示を確認しました。"); return;
  }
  if (!["setup", "start"].includes(command)) throw new SetupError("setup / start / stop / status / publish / plan のいずれかを指定してください。");
  if (!existsSync(path.join(root, ".env.local"))) throw new SetupError("最初にGoogle接続設定の .env.local を置いてください。docs/deploy-imac.mdを参照してください。");
  stop();
  await checkPort();
  if (command === "setup") run(path.join(path.dirname(process.execPath), "npm"), ["ci", "--no-audit", "--no-fund"]);
  checkSettings();
  if (command === "setup") run(path.join(path.dirname(process.execPath), "npm"), ["run", "build"], { env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
  if (!existsSync(path.join(root, ".next/BUILD_ID"))) throw new SetupError("本番ビルドがありません。setupを実行してください。");
  mkdirSync(path.dirname(agent), { recursive: true });
  mkdirSync(logs, { recursive: true, mode: 0o700 });
  chmodSync(logs, 0o700);
  writeFileSync(agent, createLaunchAgent(), { mode: 0o600 });
  chmodSync(agent, 0o600);
  run("/bin/launchctl", ["bootstrap", `gui/${process.getuid()}`, agent]);
  await ready();
  console.log("iMac上の予約ページを起動しました。ログイン後の自動起動と、稼働中のアイドルスリープ防止を設定しました。");
  console.log("外部公開とGoogleカレンダーの空き確認は、docs/deploy-imac.mdの手順で続けて確認してください。");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    // 接続設定や上流レスポンスの値を意図せず表示しない。
    console.error(error instanceof SetupError ? error.message : "設定を完了できませんでした。macOS・Node.jsの対応版、.env.local、本番ビルド、3000番ポートを確認してください。詳細はdocs/deploy-imac.mdを参照してください。");
    process.exitCode = 1;
  });
}
