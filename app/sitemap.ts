import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getNewsList } from "@/lib/microcms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/studio",
    "/equipment",
    "/price",
    "/gallery",
    "/shooting",
    "/news",
    "/noda",
    "/terms",
    "/company",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const news = await getNewsList();
  const newsRoutes = news.map((n) => ({
    url: `${base}/news/${n.id}`,
    lastModified: new Date(n.publishedAt),
  }));

  return [...staticRoutes, ...newsRoutes];
}
