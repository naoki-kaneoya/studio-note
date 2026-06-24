import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/Section";
import GalleryGrid from "@/components/GalleryGrid";
import BookingButton from "@/components/BookingButton";
import { getGalleryList } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "ギャラリー",
  description:
    "Studio note で撮影された作例と、スタジオの空間。カテゴリで絞り込んでご覧いただけます。",
};

export default async function GalleryPage() {
  const items = await getGalleryList();

  return (
    <Section>
      <SectionHeading
        eyebrow="Gallery"
        title="ギャラリー"
        lead="Studio note で撮影された作例と、スタジオの空間。"
      />
      <GalleryGrid items={items} filterable />
      <div className="mt-14">
        <BookingButton location="gallery" />
      </div>
    </Section>
  );
}
