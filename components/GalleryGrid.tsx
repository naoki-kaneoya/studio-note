"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { inCategory, type Gallery } from "@/types";

type Filter = "すべて" | "作例" | "空間";

type Props = {
  items: Gallery[];
  /** フィルタUIを表示するか（トップの抜粋では非表示） */
  filterable?: boolean;
};

export default function GalleryGrid({ items, filterable = true }: Props) {
  const [filter, setFilter] = useState<Filter>("すべて");
  const [active, setActive] = useState<Gallery | null>(null);

  const filtered = useMemo(
    () =>
      filter === "すべて"
        ? items
        : items.filter((i) => inCategory(i.category, filter)),
    [items, filter]
  );

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
        作例を準備中です。
      </p>
    );
  }

  const filters: Filter[] = ["すべて", "作例", "空間"];

  return (
    <div>
      {filterable && (
        <div className="mb-6 flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                filter === f
                  ? "bg-accent text-white"
                  : "border border-ink/20 text-ink/70 hover:border-accent hover:text-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {filtered.map((g) => (
          <li key={g.id}>
            <button
              type="button"
              onClick={() => setActive(g)}
              className="group block w-full overflow-hidden rounded-lg bg-offwhite"
            >
              <Image
                src={`${g.image.url}?w=600&fm=webp&q=80`}
                alt={g.caption || "Studio note 作例"}
                width={600}
                height={Math.round((g.image.height / g.image.width) * 600) || 450}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-matte/90 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-full max-w-4xl">
            <Image
              src={`${active.image.url}?w=1400&fm=webp&q=85`}
              alt={active.caption || "Studio note 作例"}
              width={1400}
              height={
                Math.round((active.image.height / active.image.width) * 1400) ||
                1050
              }
              className="h-auto max-h-[85vh] w-auto rounded"
            />
            {active.caption && (
              <p className="mt-3 text-center text-sm text-white/80">
                {active.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
