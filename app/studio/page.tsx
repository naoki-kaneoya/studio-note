import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MapEmbed from "@/components/MapEmbed";
import { getGalleryList } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "スタジオ詳細",
  description:
    "40㎡・天井高2.7m・最大10名。完全遮光・全面ホワイト・エレベーター直結・インボイス対応の白スタジオ。スペック・主要機材・利用ルール・アクセス。",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "Georgia,serif",
  fontSize: 13,
  letterSpacing: "0.3em",
  color: "#1A2A40",
  textTransform: "uppercase",
};
const h2: React.CSSProperties = { margin: "16px 0 0", fontWeight: 700, fontSize: "clamp(24px,3.4vw,38px)", lineHeight: 1.4 };

const SPECS: [string, string][] = [
  ["広さ", "約 40 ㎡（25畳）"],
  ["天井高", "約 2.7 m"],
  ["定員", "最大 10 名"],
  ["遮光", "完全遮光"],
  ["床・壁", "全面ホワイト"],
  ["設備", "Wi-Fi・インボイス対応"],
  ["営業時間", "10:00 – 20:00"],
  ["アクセス", "庄内駅 徒歩1分"],
];

const GEAR = ["NANLITE FS-300B ／ Godox DE300＋DP1000", "ソフトボックス / アンブレラ各種", "定常光・ストロボ完備", "40インチモニター＋テザーケーブル"];
const STYLING = ["女優ミラードレッサー / メイクワゴン", "姿見 / カポック（白黒）", "ライトスタンド一式", "Wi-Fi / 着替えスペース"];

const RULES = [
  "全面禁煙（電子タバコ含む）。火気の使用はできません。",
  "大音量・強い匂いを伴う飲食（カレー等）はご遠慮ください。",
  "退室時は原状復帰・床清掃・ゴミ持ち帰り（未実施は復帰料3万円）。",
  "スタンド類は引きずらず持ち上げて移動（床材保護）。",
  "防犯カメラ常時稼働。無人運営のため連絡は公式LINEへ。",
];

export default async function StudioPage() {
  const space = await getGalleryList("空間");
  const tiles = space.slice(0, 6);

  return (
    <main>
      {/* ヘッダー */}
      <section style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(40px,5vw,56px)" }}>
        <div className="dc-wrap dc-fadeup">
          <span style={eyebrow}>Studio</span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            完全遮光のホワイトスタジオ。
          </h1>
          <p style={{ margin: "22px 0 0", maxWidth: 560, color: "#555", fontSize: 16, lineHeight: 1.95 }}>
            光を一から組める全面ホワイトの空間。庄内駅から徒歩1分、無人で気兼ねなく使えるレンタルスタジオです。
          </p>
        </div>
      </section>

      {/* バナー */}
      <section style={{ background: "#FFFFFF", padding: "0 clamp(20px,5vw,32px) clamp(40px,5vw,64px)" }}>
        <div className="dc-wrap dc-reveal" style={{ aspectRatio: "16/7", overflow: "hidden", borderRadius: 3, background: "#eceae6" }}>
          <Image src="/hero-poster.jpg" alt="スタジオ全景" width={1152} height={504} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </section>

      {/* スペック */}
      <section id="spec" style={{ background: "#F7F6F4", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap">
          <div className="dc-reveal">
            <span style={eyebrow}>Specifications</span>
            <h2 style={h2}>スペック</h2>
          </div>
          <div className="dc-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 clamp(28px,4vw,56px)", marginTop: "clamp(36px,4vw,56px)" }}>
            {SPECS.map(([k, v]) => (
              <div key={k} style={{ padding: "22px 0", borderTop: "1px solid rgba(42,42,42,0.14)" }}>
                <span style={{ display: "block", fontSize: 12, letterSpacing: "0.08em", color: "#999" }}>{k}</span>
                <span style={{ display: "block", marginTop: 8, fontSize: 17 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 空間ギャラリー */}
      <section id="space" style={{ background: "#FFFFFF", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap">
          <div className="dc-reveal">
            <span style={eyebrow}>Space</span>
            <h2 style={h2}>空間ギャラリー</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(12px,1.5vw,20px)", marginTop: "clamp(36px,4vw,56px)" }}>
            {(tiles.length > 0 ? tiles : [0, 1, 2, 3, 4, 5]).map((t, i) =>
              typeof t === "number" ? (
                <div key={i} className="dc-reveal" style={{ aspectRatio: "4/3", borderRadius: 2, background: "#eceae6", display: "flex", alignItems: "center", justifyContent: "center", color: "#b9b6b0", fontSize: 12 }}>
                  準備中
                </div>
              ) : (
                <div key={t.id} className="dc-reveal group" style={{ overflow: "hidden", aspectRatio: "4/3", borderRadius: 2, background: "#eceae6" }}>
                  <Image src={`${t.image.url}?w=600&fm=webp&q=80`} alt={t.caption || "空間"} width={600} height={450} className="transition-transform duration-700 group-hover:scale-105" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 主要機材 */}
      <section id="equipment" style={{ background: "#F7F6F4", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap">
          <div className="dc-reveal" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span style={eyebrow}>Equipment</span>
              <h2 style={h2}>主要機材</h2>
            </div>
            <Link href="/equipment" style={{ fontSize: 14, letterSpacing: "0.04em", textDecoration: "none", color: "#1A2A40", borderBottom: "1px solid rgba(26,42,64,0.4)", paddingBottom: 4 }}>
              機材一覧を見る →
            </Link>
          </div>
          <p className="dc-reveal" style={{ margin: "20px 0 0", color: "#555", fontSize: 15, lineHeight: 1.95, maxWidth: 640 }}>
            背景紙以外の機材はすべて無料。使い慣れた機材の持ち込みもOKです。
          </p>
          <div className="dc-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(36px,5vw,72px)", marginTop: "clamp(36px,4vw,56px)" }}>
            {[["撮影機材", GEAR], ["スタイリング・その他", STYLING]].map(([label, list]) => (
              <div key={label as string}>
                <span style={{ fontSize: 12, letterSpacing: "0.1em", color: "#999" }}>{label as string}</span>
                <div style={{ marginTop: 14 }}>
                  {(list as string[]).map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 0", borderTop: "1px solid rgba(42,42,42,0.12)" }}>
                      <span style={{ fontSize: 16 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 利用ルール */}
      <section id="rules" style={{ background: "#FFFFFF", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(36px,5vw,72px)" }}>
          <div className="dc-reveal">
            <span style={eyebrow}>Rules</span>
            <h2 style={h2}>利用ルール</h2>
            <p style={{ margin: "18px 0 0", color: "#555", fontSize: 15, lineHeight: 1.95 }}>
              テナントビル内のため、他テナント・近隣への配慮をお願いします。キャンセルポリシーは予約システム（Upnow）の規定に準じます。
            </p>
          </div>
          <div className="dc-reveal">
            {RULES.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "18px 0", borderTop: "1px solid rgba(42,42,42,0.12)", borderBottom: i === RULES.length - 1 ? "1px solid rgba(42,42,42,0.12)" : undefined }}>
                <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#1A2A40" }}>{String(i + 1).padStart(2, "0")}</span>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.85 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* アクセス */}
      <section id="access" style={{ background: "#F7F6F4", padding: "clamp(72px,10vw,116px) clamp(20px,5vw,32px)" }}>
        <div className="dc-wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(36px,5vw,72px)", alignItems: "center" }}>
          <div className="dc-reveal">
            <span style={eyebrow}>Access</span>
            <h2 style={h2}>庄内駅から、徒歩1分。</h2>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <span style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", color: "#999" }}>住所</span>
                <p style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.8 }}>大阪府豊中市庄内西町3-1-5<br />サンパティオビル3階</p>
              </div>
              <div>
                <span style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", color: "#999" }}>アクセス</span>
                <p style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.8 }}>阪急宝塚線「庄内駅」徒歩1分／エレベーター直結</p>
              </div>
            </div>
          </div>
          <div className="dc-reveal">
            <MapEmbed />
          </div>
        </div>
      </section>
    </main>
  );
}
