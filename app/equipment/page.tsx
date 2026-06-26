import type { Metadata } from "next";
import Image from "next/image";
import { getEquipmentList } from "@/lib/microcms";
import { inCategory, type Equipment } from "@/types";

export const metadata: Metadata = {
  title: "機材",
  description:
    "常設の撮影機材とスタイリング什器。背景紙以外の機材はすべて無料、持ち込みもOK。有料マークの機材は別途料金がかかります。",
};

function Card({ e }: { e: Equipment }) {
  return (
    <div className="dc-reveal">
      <div style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: 2, background: "#eceae6", position: "relative" }}>
        {e.isPaid && (
          <span style={{ position: "absolute", top: 10, left: 10, zIndex: 2, fontSize: 11, letterSpacing: "0.04em", color: "#fff", background: "#1A2A40", padding: "4px 11px", borderRadius: 999 }}>
            有料
          </span>
        )}
        {e.image ? (
          <Image src={`${e.image.url}?w=500&fm=webp&q=80`} alt={e.name} width={500} height={375} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#b9b6b0", fontSize: 12 }}>機材写真</div>
        )}
      </div>
      <h3 style={{ margin: "16px 0 0", fontWeight: 500, fontSize: 16 }}>{e.name}</h3>
      <span style={{ display: "block", marginTop: 5, fontFamily: "Georgia,serif", fontSize: 12, letterSpacing: "0.12em", color: "#999" }}>
        {e.isPaid ? "+¥2,200 / 本" : e.modelNumber || "—"}
      </span>
    </div>
  );
}

function SectionBlock({ title, items, dark }: { title: string; items: Equipment[]; dark?: boolean }) {
  return (
    <section style={{ background: dark ? "#F7F6F4" : "#FFFFFF", padding: dark ? "clamp(56px,8vw,88px) clamp(20px,5vw,32px) clamp(80px,12vw,120px)" : "0 clamp(20px,5vw,32px) clamp(56px,8vw,88px)" }}>
      <div className="dc-wrap">
        <div className="dc-reveal" style={{ borderTop: "2px solid #2A2A2A", paddingTop: 20 }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: "clamp(20px,2.6vw,28px)" }}>{title}</h2>
        </div>
        {items.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "clamp(20px,2.5vw,36px)", marginTop: "clamp(32px,4vw,48px)" }}>
            {items.map((e) => <Card key={e.id} e={e} />)}
          </div>
        ) : (
          <p style={{ marginTop: 32, color: "#999", fontSize: 14 }}>準備中です。</p>
        )}
      </div>
    </section>
  );
}

export default async function EquipmentPage() {
  const items = await getEquipmentList();
  const gear = items.filter((e) => inCategory(e.category, "撮影機材"));
  const styling = items.filter((e) => inCategory(e.category, "スタイリング・その他"));

  return (
    <main>
      <section style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(40px,5vw,56px)" }}>
        <div className="dc-wrap dc-fadeup">
          <span style={{ fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" }}>
            Equipment
          </span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            機材一覧
          </h1>
          <p style={{ margin: "22px 0 0", maxWidth: 560, color: "#555", fontSize: 16, lineHeight: 1.95 }}>
            常設の撮影機材と、スタイリング用の什器・備品です。背景紙以外の機材はすべて無料、
            <span style={{ color: "#1A2A40" }}>有料</span>
            マークのある機材は別途料金がかかります。
          </p>
        </div>
      </section>

      <SectionBlock title="撮影機材" items={gear} />
      <SectionBlock title="スタイリング・その他" items={styling} dark />
    </main>
  );
}
