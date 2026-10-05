import type { Metadata } from "next";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";
import { getBookingBackendConfig } from "@/lib/google-booking";
import { todayInJapan } from "@/lib/booking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "施設予約",
  description: "Studio note・野田小学校の利用日時を選んで予約。Googleカレンダーの招待を受け取れます。",
  robots: { index: false, follow: false },
};

export default function BookingPage({ searchParams }: { searchParams: { resource?: string } }) {
  const ready = Boolean(getBookingBackendConfig());
  return (
    <section className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <Link href="/" className="text-sm text-slate-600 underline underline-offset-4">施設案内へ</Link>
      <p className="mt-8 text-sm text-slate-600">豊中ベンチャー・関連グループの皆さまへ</p>
      <h1 className="mt-3 text-3xl font-bold leading-snug">施設を予約する</h1>
      <p className="mt-5 leading-7 text-slate-600">施設と利用日を選ぶと、空いている時間を確認できます。利用時間を決めて予約すると、メールアドレスにGoogleカレンダーの招待を送ります。</p>
      <BookingForm today={todayInJapan()} initialResource={searchParams.resource === "noda" ? "noda" : "studio"} ready={ready} />
    </section>
  );
}
