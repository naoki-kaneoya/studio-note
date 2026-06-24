import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/Section";
import NewsList from "@/components/NewsList";
import { getNewsList } from "@/lib/microcms";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "Studio note からのお知らせ一覧。",
};

export default async function NewsPage() {
  const news = await getNewsList();
  return (
    <Section>
      <SectionHeading title="お知らせ" />
      <NewsList items={news} />
    </Section>
  );
}
