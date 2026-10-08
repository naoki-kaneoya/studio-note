import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBookingBar from "@/components/MobileBookingBar";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name}｜完全遮光の白スタジオ（大阪・庄内）`,
    template: `%s｜${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "完全遮光",
    "白スタジオ",
    "レンタルスタジオ",
    "庄内",
    "大阪",
    "プロ機材",
    "撮影スタジオ",
  ],
  openGraph: {
    title: `${SITE.name}｜完全遮光の白スタジオ（大阪・庄内）`,
    description: SITE.description,
    type: "website",
    locale: "ja_JP",
    url: SITE.url,
    siteName: SITE.name,
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="facility-site">
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileBookingBar />
      <GoogleAnalytics />
    </div>
  );
}
