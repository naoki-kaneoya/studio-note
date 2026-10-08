"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import BookingButton from "@/components/BookingButton";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
          padding: "0 clamp(20px,5vw,32px)",
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(42,42,42,0.08)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1,
            textDecoration: "none",
            color: "#2A2A2A",
          }}
        >
          <span
            style={{ fontFamily: "Georgia,serif", fontSize: 21, letterSpacing: "0.02em" }}
          >
            Studio note
          </span>
          <span
            style={{
              fontFamily: "Georgia,serif",
              fontSize: 9,
              letterSpacing: "0.34em",
              color: "#1A2A40",
              marginTop: 5,
              textTransform: "uppercase",
            }}
          >
            Rental Studio Osaka
          </span>
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden items-center lg:flex" style={{ gap: "clamp(18px,2.4vw,38px)" }}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 13,
                letterSpacing: "0.04em",
                textDecoration: "none",
                color: isActive(l.href) ? "#1A2A40" : "#2A2A2A",
                fontWeight: isActive(l.href) ? 500 : 400,
              }}
            >
              {l.en}
            </Link>
          ))}
          <BookingButton location="header" size="header" />
        </nav>

        {/* モバイル ハンバーガー */}
        <button
          type="button"
          aria-label="メニュー"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex flex-col gap-[5px] lg:hidden"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}
        >
          <span style={{ display: "block", width: 24, height: 1.5, background: "#2A2A2A" }} />
          <span style={{ display: "block", width: 24, height: 1.5, background: "#2A2A2A" }} />
        </button>
      </header>

      {/* フルスクリーンメニュー */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "#FFFFFF",
            padding: "28px clamp(20px,6vw,40px)",
            display: "flex",
            flexDirection: "column",
            animation: "fadein .3s ease both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 44,
            }}
          >
            <span style={{ fontFamily: "Georgia,serif", fontSize: 21 }}>Studio note</span>
            <button
              type="button"
              aria-label="閉じる"
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: 26,
                lineHeight: 1,
                cursor: "pointer",
                color: "#2A2A2A",
              }}
            >
              ×
            </button>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 48 }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  padding: "18px 0",
                  borderBottom: "1px solid rgba(42,42,42,0.1)",
                  textDecoration: "none",
                  color: isActive(l.href) ? "#1A2A40" : "#2A2A2A",
                  fontSize: 20,
                }}
              >
                {l.ja}
                <span
                  style={{
                    fontFamily: "Georgia,serif",
                    fontSize: 11,
                    letterSpacing: "0.25em",
                    color: "#1A2A40",
                  }}
                >
                  {l.en.toUpperCase()}
                </span>
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: "auto" }}>
            <BookingButton
              location="menu"
              label="予約する（Upnow）"
              className="w-full"
              style={{ width: "100%", padding: 18 }}
            />
          </div>
        </div>
      )}
    </>
  );
}
