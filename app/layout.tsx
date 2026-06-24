import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBookingBar from "@/components/MobileBookingBar";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBookingBar />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
