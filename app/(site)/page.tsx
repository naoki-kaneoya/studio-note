import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import MapEmbed from "@/components/MapEmbed";
import BookingButton from "@/components/BookingButton";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { getGalleryList, getNewsList } from "@/lib/microcms";

const SECTION_PAD = "clamp(80px,12vw,128px) clamp(20px,5vw,32px)";

function eyebrowStyle(): React.CSSProperties {
  return {
    fontFamily: "Georgia,serif",
    fontSize: 13,
    letterSpacing: "0.3em",
    color: "#1A2A40",
    textTransform: "uppercase",
  };
}
function h2Style(): React.CSSProperties {
  return {
    margin: "18px 0 0",
    fontWeight: 700,
    fontSize: "clamp(26px,3.6vw,42px)",
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  };
}
function leadStyle(): React.CSSProperties {
  return { margin: "20px 0 0", color: "#555", fontSize: 16, lineHeight: 1.95 };
}

const POINTS = [
  {
    no: "01",
    title: "光をゼロから組める",
    body: "完全遮光だから外光に左右されず、NANLITE・Godoxのストロボと定常光で思いどおりのライティングを一から構築できます。背景紙以外の機材はすべて無料。",
    tags: ["完全遮光", "機材無料"],
  },
  {
    no: "02",
    title: "駅30秒・エレベーター直結",
    body: "庄内駅から徒歩30秒、梅田から電車10分。エレベーターでフロアに直結し、大きな機材や什器の搬入もスムーズです。",
    tags: ["庄内駅30秒", "EV直結"],
  },
  {
    no: "03",
    title: "物撮りから動画まで1部屋で",
    body: "40㎡・天井高2.7m・最大10名。テザー用40インチモニター、メイクスペースも完備。物撮り・ポートレート・動画まで1部屋で完結します。",
    tags: ["40㎡", "インボイス対応"],
  },
];

const WORKS = [
  { no: "01", title: "ポートレート", img: "/usecase-portrait.jpg" },
  { no: "02", title: "物撮り・商品撮影", img: "/usecase-product.jpg" },
  { no: "03", title: "動画撮影", img: "/usecase-video.jpg" },
  { no: "04", title: "コスプレ", img: "/usecase-cosplay.jpg" },
];

const FLOW = [
  { no: "01", title: "予約する", body: "Upnow で希望の日時を選んで予約。空き状況もその場で確認できます。" },
  { no: "02", title: "解錠・入室", body: "公式LINEの案内に沿って無人で入室。鍵の受け渡しは不要です。" },
  { no: "03", title: "撮影", body: "常設機材と背景紙を使って、予約時間いっぱい自由に撮影できます。" },
  { no: "04", title: "退室", body: "機材を元に戻し、原状復帰のうえそのまま退室。返却手続きはありません。" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function HomePage() {
  const [gallery, news] = await Promise.all([getGalleryList(), getNewsList(3)]);
  const galleryTiles = gallery.slice(0, 4);

  return (
    <>
      <LocalBusinessJsonLd />
      <Hero />

      {/* POINT */}
      <section id="point" style={{ background: "#FFFFFF", padding: SECTION_PAD }}>
        <div className="dc-wrap">
          <div className="dc-reveal" style={{ maxWidth: 680 }}>
            <span style={eyebrowStyle()}>Studio</span>
            <h2 style={h2Style()}>無人でも、妥協しない撮影を。</h2>
            <p style={leadStyle()}>
              完全遮光・全面ホワイトの空間に、光を組むための機材を常設。駅から30秒、ひと部屋で多用途。3つの強みをご紹介します。
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))",
              gap: "clamp(28px,3.5vw,56px)",
              marginTop: "clamp(48px,6vw,80px)",
            }}
          >
            {POINTS.map((p) => (
              <div key={p.no} className="dc-reveal">
                <div
                  style={{
                    height: 1,
                    background: "#2A2A2A",
                    transformOrigin: "left",
                    animation: "lineGrow 1s cubic-bezier(.16,1,.3,1) both",
                    animationTimeline: "view()",
                    animationRange: "entry 0% cover 26%",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    fontFamily: "Georgia,serif",
                    fontSize: 13,
                    letterSpacing: "0.26em",
                    color: "#1A2A40",
                    marginTop: 20,
                  }}
                >
                  POINT {p.no}
                </span>
                <h3 style={{ margin: "14px 0 0", fontWeight: 700, fontSize: 22, lineHeight: 1.5 }}>
                  {p.title}
                </h3>
                <p style={{ margin: "14px 0 0", color: "#555", fontSize: 15, lineHeight: 1.95 }}>
                  {p.body}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 12,
                        letterSpacing: "0.04em",
                        color: "#1A2A40",
                        border: "1px solid rgba(26,42,64,0.3)",
                        padding: "6px 13px",
                        borderRadius: 999,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKS */}
      <section id="works" style={{ background: "#F7F6F4", padding: SECTION_PAD }}>
        <div className="dc-wrap">
          <div
            className="dc-reveal"
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}
          >
            <div>
              <span style={eyebrowStyle()}>Works</span>
              <h2 style={h2Style()}>さまざまな用途で。</h2>
            </div>
            <p style={{ maxWidth: 360, color: "#555", fontSize: 15, lineHeight: 1.95, margin: 0 }}>
              ポートレートから物撮り、動画、コスプレまで。撮りたいイメージにあわせて空間を使えます。
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
              gap: "clamp(16px,2vw,28px)",
              marginTop: "clamp(40px,5vw,68px)",
            }}
          >
            {WORKS.map((w) => (
              <div key={w.no} className="dc-reveal group">
                <div style={{ overflow: "hidden", aspectRatio: "4/5", borderRadius: 2, background: "#eceae6" }}>
                  <Image
                    src={w.img}
                    alt={w.title}
                    width={460}
                    height={575}
                    className="transition-transform duration-700 group-hover:scale-105"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 11, letterSpacing: "0.24em", color: "#999" }}>
                    {w.no}
                  </span>
                  <h3 style={{ margin: "6px 0 0", fontWeight: 500, fontSize: 16 }}>{w.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ background: "#FFFFFF", padding: SECTION_PAD }}>
        <div className="dc-wrap">
          <div
            className="dc-reveal"
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}
          >
            <div>
              <span style={eyebrowStyle()}>Gallery</span>
              <h2 style={h2Style()}>空間と、作例。</h2>
            </div>
            <Link
              href="/gallery"
              style={{
                fontSize: 14,
                letterSpacing: "0.04em",
                textDecoration: "none",
                color: "#1A2A40",
                borderBottom: "1px solid rgba(26,42,64,0.4)",
                paddingBottom: 4,
              }}
            >
              ギャラリーを見る →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "clamp(12px,1.5vw,20px)",
              marginTop: "clamp(40px,5vw,64px)",
            }}
          >
            {galleryTiles.length > 0
              ? galleryTiles.map((g) => (
                  <div
                    key={g.id}
                    className="dc-reveal"
                    style={{ overflow: "hidden", aspectRatio: "3/4", borderRadius: 2, background: "#eceae6" }}
                  >
                    <Image
                      src={`${g.image.url}?w=600&fm=webp&q=80`}
                      alt={g.caption || "作例"}
                      width={600}
                      height={800}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))
              : [0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="dc-reveal"
                    style={{
                      aspectRatio: "3/4",
                      borderRadius: 2,
                      background: "#eceae6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#b9b6b0",
                      fontSize: 12,
                    }}
                  >
                    準備中
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* PRICE */}
      <section id="price" style={{ background: "#F7F6F4", padding: SECTION_PAD }}>
        <div
          className="dc-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "clamp(40px,6vw,88px)",
            alignItems: "center",
          }}
        >
          <div className="dc-reveal">
            <span style={eyebrowStyle()}>Price</span>
            <h2 style={h2Style()}>シンプルな時間料金。</h2>
            <p style={leadStyle()}>
              1時間 ¥4,400〜（税込）。営業時間 10:00–20:00。平日・土日祝で変動。背景紙のご利用は1本あたり +¥2,200。予約・キャンセルは Upnow から承ります。
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 34 }}>
              <BookingButton location="top_price" />
              <Link href="/price" className="dc-btn dc-btn-outline">
                料金の詳細
              </Link>
            </div>
          </div>
          <div
            className="dc-reveal"
            style={{ background: "#FFFFFF", borderRadius: 3, padding: "clamp(36px,4vw,56px)" }}
          >
            <span style={{ fontSize: 13, letterSpacing: "0.1em", color: "#777" }}>レンタル料金</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: "clamp(48px,7vw,76px)", lineHeight: 1, color: "#1A2A40" }}>
                ¥4,400
              </span>
              <span style={{ fontSize: 18, color: "#555" }}>〜</span>
            </div>
            <span style={{ display: "block", marginTop: 8, fontSize: 14, color: "#777" }}>
              1時間あたり（税込）
            </span>
            <div style={{ height: 1, background: "rgba(42,42,42,0.12)", margin: "28px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["営業時間", "10:00 – 20:00"],
                ["背景紙", "+¥2,200 / 本"],
                ["予約方法", "Upnow（外部）"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                  <span style={{ color: "#555" }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section id="flow" style={{ background: "#FFFFFF", padding: SECTION_PAD }}>
        <div className="dc-wrap">
          <div className="dc-reveal">
            <span style={eyebrowStyle()}>Flow</span>
            <h2 style={h2Style()}>ご利用の流れ</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "clamp(24px,3vw,44px)",
              marginTop: "clamp(44px,5vw,72px)",
            }}
          >
            {FLOW.map((s) => (
              <div key={s.no} className="dc-reveal">
                <span style={{ fontFamily: "Georgia,serif", fontSize: "clamp(40px,5vw,56px)", lineHeight: 1, color: "rgba(26,42,64,0.18)" }}>
                  {s.no}
                </span>
                <h3 style={{ margin: "16px 0 0", fontWeight: 700, fontSize: 18 }}>{s.title}</h3>
                <p style={{ margin: "12px 0 0", color: "#555", fontSize: 14, lineHeight: 1.9 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 28, fontSize: 13, color: "#999" }}>
            無人運営のため電話対応はありません。ご連絡は公式LINEへ。
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ background: "#F7F6F4", padding: SECTION_PAD }}>
        <div
          className="dc-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div
            className="dc-reveal"
            style={{ overflow: "hidden", aspectRatio: "5/4", borderRadius: 3, background: "#eceae6" }}
          >
            <Image
              src="/hero-poster.jpg"
              alt="Studio note の空間"
              width={760}
              height={608}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="dc-reveal">
            <span style={eyebrowStyle()}>About</span>
            <h2 style={h2Style()}>完全遮光の、ホワイトキューブ。</h2>
            <p style={leadStyle()}>
              「機材無料と書いてあるのにプロ仕様じゃない」——そんなストレスを解消したくて、運営2社のフォトグラファーがプロに必要な機材を全部詰めて設計したスタジオです。外光を完全に遮断した全面ホワイトの空間に、ライティング機材を常設しています。
            </p>
            <p style={{ margin: "18px 0 0", color: "#555", fontSize: 16, lineHeight: 1.95 }}>
              運営は無人。予約から解錠まで非対面で完結し、ご連絡は公式LINEで承ります。撮影そのもののご依頼も承っています。
            </p>
            <div style={{ marginTop: 28 }}>
              <Link href="/shooting" className="dc-btn dc-btn-outline">
                撮影を依頼したい方へ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section id="news" style={{ background: "#FFFFFF", padding: SECTION_PAD }}>
        <div className="dc-wrap">
          <div
            className="dc-reveal"
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}
          >
            <div>
              <span style={eyebrowStyle()}>News</span>
              <h2 style={h2Style()}>お知らせ</h2>
            </div>
            <Link
              href="/news"
              style={{
                fontSize: 14,
                letterSpacing: "0.04em",
                textDecoration: "none",
                color: "#1A2A40",
                borderBottom: "1px solid rgba(26,42,64,0.4)",
                paddingBottom: 4,
              }}
            >
              すべて見る →
            </Link>
          </div>
          <div className="dc-reveal" style={{ marginTop: "clamp(36px,4vw,56px)" }}>
            {news.length === 0 && <p style={{ color: "#999", fontSize: 15 }}>現在お知らせはありません。</p>}
            {news.map((n, i) => (
              <Link
                key={n.id}
                href={`/news/${n.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  alignItems: "center",
                  gap: "clamp(14px,2vw,28px)",
                  padding: "22px 0",
                  borderTop: "1px solid rgba(42,42,42,0.12)",
                  borderBottom: i === news.length - 1 ? "1px solid rgba(42,42,42,0.12)" : undefined,
                  textDecoration: "none",
                  color: "#2A2A2A",
                }}
              >
                <span style={{ fontFamily: "Georgia,serif", fontSize: 14, letterSpacing: "0.08em", color: "#888" }}>
                  {formatDate(n.publishedAt)}
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.6 }}>{n.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESS */}
      <section id="access" style={{ background: "#F7F6F4", padding: SECTION_PAD }}>
        <div
          className="dc-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div className="dc-reveal">
            <span style={eyebrowStyle()}>Access</span>
            <h2 style={h2Style()}>庄内駅から、徒歩1分。</h2>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                ["住所", "大阪府豊中市庄内西町3-1-5\nサンパティオビル3階"],
                ["アクセス", "阪急宝塚線「庄内駅」徒歩1分／梅田から電車10分／エレベーター直結"],
                ["お問い合わせ", "無人運営・ご連絡は公式LINEから"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", color: "#999" }}>{k}</span>
                  <p style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.8, whiteSpace: "pre-line" }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <BookingButton location="top_access" />
            </div>
          </div>
          <div className="dc-reveal">
            <MapEmbed />
          </div>
        </div>
      </section>
    </>
  );
}
