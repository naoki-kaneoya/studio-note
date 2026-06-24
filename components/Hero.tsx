import Link from "next/link";
import BookingButton from "@/components/BookingButton";

/**
 * トップのヒーロー。黒マット背景＋動画ループ。
 * 動画/ポスターが未配置でも、bg-matte によりレイアウトは成立する。
 * 動画は /public/hero.mp4、ポスターは /public/hero-poster.jpg を想定。
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-matte text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/hero-poster.jpg"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-matte/40" />

      <div className="relative mx-auto w-full max-w-content px-5 py-24">
        <h1 className="text-3xl font-bold leading-tight md:text-5xl">
          思いどおりの光を、
          <br />
          自分の手で。
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
          外光ゼロの完全遮光スタジオ。NANLITE・Godoxのプロ機材を自由に組んで、
          時間に縛られず光をつくれる。庄内駅30秒・梅田10分。
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <BookingButton location="hero" />
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-bold tracking-wide2 text-white transition-colors hover:bg-white hover:text-matte"
          >
            スタジオを見る
          </Link>
        </div>
      </div>
    </section>
  );
}
