/**
 * microCMS 初期データ投入スクリプト（一回限り想定）。
 * 使い方:
 *   MICROCMS_SERVICE_DOMAIN=studionote MICROCMS_API_KEY=xxxx node scripts/seed-microcms.mjs
 *
 * 注意: セレクトフィールド(category)は配列で送る必要がある。
 */

const domain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!domain || !apiKey) {
  console.error("MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が必要です。");
  process.exit(1);
}

const base = `https://${domain}.microcms.io/api/v1`;

async function post(endpoint, body) {
  const res = await fetch(`${base}/${endpoint}`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST /${endpoint} -> ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

const equipment = [
  // 撮影機材
  { name: "NANLITE FS-300B ×2", modelNumber: "FS-300B", category: ["撮影機材"], isPaid: false, order: 10 },
  { name: "NEEWER RGBライト ×2", category: ["撮影機材"], isPaid: false, order: 20 },
  { name: "Godox DE300＋DP1000 ×2", modelNumber: "DE300 / DP1000", category: ["撮影機材"], isPaid: false, order: 30 },
  { name: "Godox ソフトボックス 各種", category: ["撮影機材"], isPaid: false, order: 40 },
  { name: "アンブレラ", category: ["撮影機材"], isPaid: false, order: 50 },
  { name: "カポック（白／黒）", category: ["撮影機材"], isPaid: false, order: 60 },
  { name: "ライトスタンド（最大334cm 等）", category: ["撮影機材"], isPaid: false, order: 70 },
  { name: "背景紙 5色", category: ["撮影機材"], isPaid: true, order: 80 },
  { name: "Manfrotto 背景紙システム", category: ["撮影機材"], isPaid: false, order: 90 },
  { name: "グリップアーム", category: ["撮影機材"], isPaid: false, order: 100 },
  { name: "40インチモニター", category: ["撮影機材"], isPaid: false, order: 110 },
  { name: "テザーケーブル 4.7m", category: ["撮影機材"], isPaid: false, order: 120 },
  { name: "脚立", category: ["撮影機材"], isPaid: false, order: 130 },
  { name: "ツールカート", category: ["撮影機材"], isPaid: false, order: 140 },
  { name: "延長コード類", category: ["撮影機材"], isPaid: false, order: 150 },
  { name: "カラーチェッカー（SpyderCHECKR／シルクグレーカード）", category: ["撮影機材"], isPaid: false, order: 160 },
  // スタイリング・その他
  { name: "女優ミラードレッサー", category: ["スタイリング・その他"], isPaid: false, order: 10 },
  { name: "メイクワゴン ×2", category: ["スタイリング・その他"], isPaid: false, order: 20 },
  { name: "ヘアアイロン", category: ["スタイリング・その他"], isPaid: false, order: 30 },
  { name: "衣服アイロン", category: ["スタイリング・その他"], isPaid: false, order: 40 },
  { name: "姿見", category: ["スタイリング・その他"], isPaid: false, order: 50 },
];

const news = [
  {
    title: "野田小学校スタジオ 営業終了のお知らせ",
    body: "<p>野田小学校スタジオは、2026年12月28日をもって営業を終了いたします。長らくのご利用、誠にありがとうございました。営業終了まで通常どおりご予約いただけます。</p>",
    category: ["お知らせ"],
  },
];

async function main() {
  let ok = 0;
  let fail = 0;

  for (const e of equipment) {
    try {
      const r = await post("equipment", e);
      ok++;
      console.log(`✓ equipment: ${e.name} -> ${r.id}`);
    } catch (err) {
      fail++;
      console.error(`✗ equipment: ${e.name}\n   ${err.message}`);
    }
  }

  for (const n of news) {
    try {
      const r = await post("news", n);
      ok++;
      console.log(`✓ news: ${n.title} -> ${r.id}`);
    } catch (err) {
      fail++;
      console.error(`✗ news: ${n.title}\n   ${err.message}`);
    }
  }

  console.log(`\n完了: 成功 ${ok} 件 / 失敗 ${fail} 件`);
  if (fail > 0) process.exit(1);
}

main();
