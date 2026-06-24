"use client";

import { trackEvent } from "@/lib/gtag";
import { UPNOW_STUDIO_URL } from "@/lib/site";

type Props = {
  href?: string;
  label?: string;
  /** GA計測のための設置場所ラベル */
  location?: string;
  variant?: "solid" | "outline";
  className?: string;
};

/**
 * 「空き状況・予約」ボタン。リンク先は環境変数（既定はスタジオUpnow）。
 * クリックを GA4 イベント booking_click として計測する。
 */
export default function BookingButton({
  href = UPNOW_STUDIO_URL,
  label = "空き状況・予約",
  location = "unknown",
  variant = "solid",
  className = "",
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold tracking-wide2 transition-colors";
  const styles =
    variant === "solid"
      ? "bg-accent text-white hover:bg-accent/90"
      : "border border-accent text-accent hover:bg-accent hover:text-white";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent("booking_click", { location, href })}
      className={`${base} ${styles} ${className}`}
    >
      {label}
    </a>
  );
}
