import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/Section";
import EquipmentList from "@/components/EquipmentList";
import BookingButton from "@/components/BookingButton";
import { getEquipmentList } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "機材",
  description:
    "NANLITE・Godoxのプロ機材を完備。背景紙以外の機材はすべて無料、持ち込みもOK。撮影機材とスタイリング・その他の機材一覧。",
};

export default async function EquipmentPage() {
  const items = await getEquipmentList();

  return (
    <Section>
      <SectionHeading
        eyebrow="Equipment"
        title="機材"
        lead="背景紙以外の機材はすべて無料。使い慣れた機材の持ち込みもOK。"
      />
      <nav className="mb-10 flex gap-4 text-sm">
        <a
          href="#gear"
          className="text-accent underline underline-offset-4"
        >
          撮影機材
        </a>
        <a
          href="#styling"
          className="text-accent underline underline-offset-4"
        >
          スタイリング・その他
        </a>
      </nav>

      <EquipmentList items={items} />

      <div className="mt-14">
        <BookingButton location="equipment" />
      </div>
    </Section>
  );
}
