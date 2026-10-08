import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { getBookingBackendConfig } from "@/lib/google-booking";
import { todayInJapan } from "@/lib/booking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "施設予約｜Studio note",
  description: "Studio note・野田小学校の利用日時を選んで予約。Googleカレンダーの招待を受け取れます。",
  robots: { index: false, follow: false },
  openGraph: {
    title: "施設予約｜Studio note",
    description: "Studio note・野田小学校の空き時間を確認して予約できます。",
    type: "website",
    locale: "ja_JP",
    url: "/book",
    siteName: "Studio note 施設予約",
  },
};

export default function BookingPage({ searchParams }: { searchParams: { resource?: string } }) {
  const ready = Boolean(getBookingBackendConfig());
  return (
    <section className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <p className="text-sm text-slate-600">豊中ベンチャー・関連グループの皆さまへ</p>
      <h1 className="mt-3 text-3xl font-bold leading-snug">施設を予約する</h1>
      <p className="mt-5 leading-7 text-slate-600">施設と利用日を選ぶと、空いている時間を確認できます。利用時間を決めて予約すると、メールアドレスにGoogleカレンダーの招待を送ります。</p>
      <BookingForm today={todayInJapan()} initialResource={searchParams.resource === "noda" ? "noda" : "studio"} ready={ready} />
    </section>
  );
}
