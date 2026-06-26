"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { inCategory, type Gallery } from "@/types";

type Filter = "all" | "作例" | "空間";

export default function GalleryGrid({ items }: { items: Gallery[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Gallery | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => inCategory(i.category, filter))),
    [items, filter]
  );

  const tab = (active_: boolean): React.CSSProperties => ({
    fontSize: 14,
    letterSpacing: "0.04em",
    padding: "9px 22px",
    borderRadius: 999,
    cursor: "pointer",
    transition: "all .2s",
    ...(active_
      ? { color: "#fff", background: "#1A2A40", border: "1px solid #1A2A40" }
      : { color: "#2A2A2A", background: "transparent", border: "1px solid rgba(42,42,42,0.22)" }),
  });

  const tabs: [Filter, string][] = [
    ["all", "すべて"],
    ["作例", "作例"],
    ["空間", "空間"],
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        {tabs.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setFilter(key)} style={tab(filter === key)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "clamp(12px,1.5vw,20px)", marginTop: "clamp(32px,4vw,48px)" }}>
        {filtered.length === 0 &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ aspectRatio: "4/5", borderRadius: 2, background: "#eceae6", display: "flex", alignItems: "center", justifyContent: "center", color: "#b9b6b0", fontSize: 12 }}>
              準備中
            </div>
          ))}
        {filtered.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g)}
            className="group"
            style={{ overflow: "hidden", aspectRatio: "4/5", borderRadius: 2, background: "#eceae6", border: "none", padding: 0, cursor: "pointer" }}
          >
            <Image
              src={`${g.image.url}?w=600&fm=webp&q=80`}
              alt={g.caption || "Studio note 作例"}
              width={600}
              height={750}
              className="transition-transform duration-700 group-hover:scale-105"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(17,17,17,0.9)", padding: 16 }}
        >
          <div style={{ maxWidth: 1100, maxHeight: "90vh" }}>
            <Image
              src={`${active.image.url}?w=1400&fm=webp&q=85`}
              alt={active.caption || "Studio note 作例"}
              width={1400}
              height={Math.round((active.image.height / active.image.width) * 1400) || 1050}
              style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "85vh", borderRadius: 2 }}
            />
            {active.caption && <p style={{ marginTop: 12, textAlign: "center", color: "rgba(255,255,255,0.85)", fontSize: 14 }}>{active.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
