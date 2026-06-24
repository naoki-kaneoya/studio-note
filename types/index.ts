/** microCMS のセレクトフィールドは単一選択でも配列で返るため string[] | string を許容する。 */
export type Category = string[] | string;

export type News = {
  id: string;
  title: string;
  body: string;
  category?: Category;
  publishedAt: string;
};

export type MicroCMSImage = {
  url: string;
  width: number;
  height: number;
};

export type Gallery = {
  id: string;
  image: MicroCMSImage;
  category: Category;
  caption?: string;
  order?: number;
};

export type Equipment = {
  id: string;
  name: string;
  modelNumber?: string;
  category: Category;
  image?: MicroCMSImage;
  isPaid: boolean;
  order: number;
};

/** セレクト値（string | string[]）に指定カテゴリが含まれるか。 */
export function inCategory(cat: Category | undefined, value: string): boolean {
  if (!cat) return false;
  return Array.isArray(cat) ? cat.includes(value) : cat === value;
}
