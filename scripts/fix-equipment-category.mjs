/**
 * 機材の category を名前ベースで正しい値に一括更新する。
 * セレクト選択肢の不一致で category が空になった場合のリカバリ用。
 *   MICROCMS_SERVICE_DOMAIN=studionote MICROCMS_API_KEY=xxxx node scripts/fix-equipment-category.mjs
 */

const domain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
if (!domain || !apiKey) {
  console.error("MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が必要です。");
  process.exit(1);
}
const base = `https://${domain}.microcms.io/api/v1`;

// 名前 → カテゴリの対応（seed と同じ）
const GEAR = new Set([
  "NANLITE FS-300B ×2",
  "NEEWER RGBライト ×2",
  "Godox DE300＋DP1000 ×2",
  "Godox ソフトボックス 各種",
  "アンブレラ",
  "カポック（白／黒）",
  "ライトスタンド（最大334cm 等）",
  "背景紙 5色",
  "Manfrotto 背景紙システム",
  "グリップアーム",
  "40インチモニター",
  "テザーケーブル 4.7m",
  "脚立",
  "ツールカート",
  "延長コード類",
  "カラーチェッカー（SpyderCHECKR／シルクグレーカード）",
]);
const STYLING = new Set([
  "女優ミラードレッサー",
  "メイクワゴン ×2",
  "ヘアアイロン",
  "衣服アイロン",
  "姿見",
]);

async function getAll() {
  const res = await fetch(`${base}/equipment?limit=100&fields=id,name`, {
    headers: { "X-MICROCMS-API-KEY": apiKey },
  });
  if (!res.ok) throw new Error(`GET equipment -> ${res.status}`);
  return (await res.json()).contents;
}

async function patch(id, category) {
  const res = await fetch(`${base}/equipment/${id}`, {
    method: "PATCH",
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PATCH ${id} -> ${res.status}: ${text}`);
}

async function main() {
  const items = await getAll();
  let ok = 0;
  let skip = 0;
  for (const it of items) {
    let category = null;
    if (GEAR.has(it.name)) category = ["撮影機材"];
    else if (STYLING.has(it.name)) category = ["スタイリング・その他"];
    if (!category) {
      console.warn(`? 未分類（手動確認）: ${it.name}`);
      skip++;
      continue;
    }
    await patch(it.id, category);
    ok++;
    console.log(`✓ ${category[0]} <- ${it.name}`);
  }
  console.log(`\n更新 ${ok} 件 / スキップ ${skip} 件`);
}

main();
