import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { getGalleryList } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "ギャラリー",
  description: "Studio note で撮影された作例と、スタジオの空間。カテゴリで絞り込んでご覧いただけます。",
};

export default async function GalleryPage() {
  const items = await getGalleryList();
  return (
    <main>
      <section style={{ background: "#FFFFFF", padding: "clamp(60px,9vw,108px) clamp(20px,5vw,32px) clamp(32px,4vw,48px)" }}>
        <div className="dc-wrap dc-fadeup">
          <span style={{ fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: "0.3em", color: "#1A2A40", textTransform: "uppercase" }}>
            Gallery
          </span>
          <h1 style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.32, letterSpacing: "-0.01em" }}>
            作例と、空間。
          </h1>
          <p style={{ margin: "22px 0 0", maxWidth: 560, color: "#555", fontSize: 16, lineHeight: 1.95 }}>
            スタジオでの撮影作例と、空間そのものの写真をご覧いただけます。
          </p>
        </div>
      </section>

      <section style={{ background: "#FFFFFF", padding: "0 clamp(20px,5vw,32px) clamp(80px,12vw,128px)" }}>
        <div className="dc-wrap">
          <GalleryGrid items={items} />
        </div>
      </section>
    </main>
  );
}
