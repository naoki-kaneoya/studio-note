import Image from "next/image";
import { inCategory, type Equipment } from "@/types";

function Item({ e }: { e: Equipment }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-ink/10 bg-base">
      {e.image && (
        <div className="aspect-[4/3] bg-offwhite">
          <Image
            src={`${e.image.url}?w=500&fm=webp&q=80`}
            alt={e.name}
            width={500}
            height={375}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-snug">{e.name}</h3>
          {e.isPaid && (
            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
              有料
            </span>
          )}
        </div>
        {e.modelNumber && (
          <p className="mt-1 text-xs text-ink/50">{e.modelNumber}</p>
        )}
      </div>
    </li>
  );
}

export default function EquipmentList({ items }: { items: Equipment[] }) {
  const gear = items.filter((e) => inCategory(e.category, "撮影機材"));
  const styling = items.filter((e) =>
    inCategory(e.category, "スタイリング・その他")
  );

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
        機材リストを準備中です。
      </p>
    );
  }

  return (
    <div className="space-y-16">
      <div id="gear" className="scroll-mt-24">
        <h2 className="mb-6 text-xl font-bold text-accent">撮影機材</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gear.map((e) => (
            <Item key={e.id} e={e} />
          ))}
        </ul>
      </div>
      <div id="styling" className="scroll-mt-24">
        <h2 className="mb-6 text-xl font-bold text-accent">
          スタイリング・その他
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {styling.map((e) => (
            <Item key={e.id} e={e} />
          ))}
        </ul>
      </div>
    </div>
  );
}
