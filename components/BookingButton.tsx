"use client";

import { trackEvent } from "@/lib/gtag";
import { UPNOW_STUDIO_URL } from "@/lib/site";

type Props = {
  href?: string;
  label?: string;
  /** GA計測のための設置場所ラベル */
  location?: string;
  /** 見た目のバリエーション */
  variant?: "solid" | "outline" | "white";
  /** ヘッダー用の小さめサイズ */
  size?: "default" | "header";
  className?: string;
  style?: React.CSSProperties;
};

/**
 * 「予約する」ボタン。リンク先は環境変数（既定はスタジオUpnow）。
 * クリックを GA4 イベント booking_click として計測する。
 */
export default function BookingButton({
  href = UPNOW_STUDIO_URL,
  label = "予約する",
  location = "unknown",
  variant = "solid",
  size = "default",
  className = "",
  style,
}: Props) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    borderRadius: "1px",
    letterSpacing: "0.12em",
    transition: "opacity .2s, background-color .2s, color .2s",
    ...(size === "header"
      ? { fontSize: "13px", padding: "11px 26px" }
      : { fontSize: "14px", padding: "16px 40px" }),
  };
  const variantStyle: React.CSSProperties =
    variant === "solid"
      ? { color: "#fff", background: "#1A2A40" }
      : variant === "white"
        ? { color: "#1A2A40", background: "#fff" }
        : { color: "#2A2A2A", border: "1px solid rgba(42,42,42,0.3)" };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent("booking_click", { location, href })}
      className={className}
      style={{ ...base, ...variantStyle, ...style }}
    >
      {label}
    </a>
  );
}
