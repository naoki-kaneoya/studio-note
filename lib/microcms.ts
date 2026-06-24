import { createClient } from "microcms-js-sdk";
import type { News, Gallery, Equipment } from "@/types";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

/**
 * microCMS の認証情報が未設定でもビルド・表示が壊れないようにする。
 * 開発初期やプレビュー時はクライアントが null になり、各取得関数は空配列を返す。
 */
export const client =
  serviceDomain && apiKey
    ? createClient({ serviceDomain, apiKey })
    : null;

const REVALIDATE = 3600; // ISR: 1時間

export async function getNewsList(limit = 100): Promise<News[]> {
  if (!client) return [];
  try {
    const data = await client.getList<News>({
      endpoint: "news",
      queries: { limit, orders: "-publishedAt" },
      customRequestInit: { next: { revalidate: REVALIDATE } },
    });
    return data.contents;
  } catch (e) {
    console.error("[microcms] getNewsList failed", e);
    return [];
  }
}

export async function getNewsDetail(id: string): Promise<News | null> {
  if (!client) return null;
  try {
    return await client.getListDetail<News>({
      endpoint: "news",
      contentId: id,
      customRequestInit: { next: { revalidate: REVALIDATE } },
    });
  } catch (e) {
    console.error("[microcms] getNewsDetail failed", e);
    return null;
  }
}

export async function getGalleryList(
  category?: "作例" | "空間"
): Promise<Gallery[]> {
  if (!client) return [];
  try {
    const data = await client.getList<Gallery>({
      endpoint: "gallery",
      queries: {
        limit: 100,
        orders: "order",
        ...(category ? { filters: `category[contains]${category}` } : {}),
      },
      customRequestInit: { next: { revalidate: REVALIDATE } },
    });
    return data.contents;
  } catch (e) {
    console.error("[microcms] getGalleryList failed", e);
    return [];
  }
}

export async function getEquipmentList(): Promise<Equipment[]> {
  if (!client) return [];
  try {
    const data = await client.getList<Equipment>({
      endpoint: "equipment",
      queries: { limit: 100, orders: "order" },
      customRequestInit: { next: { revalidate: REVALIDATE } },
    });
    return data.contents;
  } catch (e) {
    console.error("[microcms] getEquipmentList failed", e);
    return [];
  }
}
