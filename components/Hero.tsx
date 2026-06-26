import Image from "next/image";
import BookingButton from "@/components/BookingButton";

/**
 * トップのヒーロー。全面写真＋スクロール連動のゆるいパン、中央寄せのテキスト。
 * 画像は /public/hero-poster.jpg を使用（実素材が用意でき次第差し替え）。
 */
export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "clamp(560px,88vh,880px)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "#111111",
      }}
    >
      {/* 背景画像（スクロールでゆっくりパン） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: "heroPan linear both",
          animationTimeline: "scroll()",
          animationRange: "0% 100%",
        }}
      >
        <Image
          src="/hero-poster.jpg"
          alt="Studio note の白スタジオ"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* テキスト可読性のためのグラデ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(17,17,17,0.62), rgba(17,17,17,0.08) 46%, rgba(17,17,17,0) 72%), linear-gradient(to right, rgba(17,17,17,0.4), rgba(17,17,17,0) 56%)",
        }}
      />

      <div
        className="dc-fadeup"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,32px)",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia,serif",
            fontSize: "clamp(11px,1.1vw,13px)",
            letterSpacing: "0.32em",
            color: "rgba(255,255,255,0.9)",
            textTransform: "uppercase",
          }}
        >
          Rental Studio — Osaka Shonai
        </span>
        <h1
          style={{
            margin: "22px 0 0",
            color: "#fff",
            fontWeight: 700,
            fontSize: "clamp(34px,6.4vw,76px)",
            lineHeight: 1.28,
            letterSpacing: "0.01em",
            textShadow: "0 2px 30px rgba(0,0,0,0.25)",
          }}
        >
          思いどおりの光を、
          <br />
          自分の手で。
        </h1>
        <p
          style={{
            margin: "24px auto 0",
            maxWidth: 460,
            color: "rgba(255,255,255,0.92)",
            fontSize: "clamp(14px,1.4vw,16px)",
            lineHeight: 1.95,
          }}
        >
          大阪・庄内の完全遮光ホワイトスタジオ。物撮りからポートレート、動画まで、ひと部屋で思いのままに。
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 14,
            marginTop: 38,
          }}
        >
          <BookingButton location="hero" label="予約する（Upnow）" />
          <a
            href="#works"
            className="dc-btn"
            style={{
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.65)",
              backdropFilter: "blur(2px)",
            }}
          >
            スタジオを見る
          </a>
        </div>
      </div>
    </section>
  );
}
