import Link from "next/link";
import BookingButton from "@/components/BookingButton";

/**
 * トップのヒーロー。大きな写真を主役にした明るい構成。
 * 動画は /public/hero.mp4、ポスターは /public/hero-poster.jpg を想定。
 * 動画/ポスター未配置でも bg-matte でレイアウトは成立する。
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-matte text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/hero-poster.jpg"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      {/* テキスト可読性のためのグラデ（下〜左のみ・写真は明るく残す） */}
      <div className="absolute inset-0 bg-gradient-to-t from-matte/80 via-matte/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-matte/40 to-transparent" />

      <div className="relative mx-auto w-full max-w-content px-5 pb-20 pt-32 md:px-8 md:pb-28">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Rental Studio — Osaka Shonai
        </p>
        <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight md:text-6xl">
          思いどおりの光を、
          <br />
          自分の手で。
        </h1>
        <p className="mt-7 max-w-2xl text-sm leading-loose text-white/85 md:text-base">
          外光ゼロの完全遮光スタジオ。NANLITE・Godoxのプロ機材を自由に組んで、
          時間に縛られず光をつくれる。庄内駅30秒・梅田10分。
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <BookingButton location="hero" />
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-full border border-white/50 px-7 py-3 text-sm font-bold tracking-wide2 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-matte"
          >
            スタジオを見る
          </Link>
        </div>
      </div>
    </section>
  );
}
