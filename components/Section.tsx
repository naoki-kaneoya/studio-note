import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  /** 黒マット背景（必要時のみ。基本は白〜オフホワイト） */
  dark?: boolean;
  /** オフホワイト背景でリズムを作る */
  muted?: boolean;
  id?: string;
  className?: string;
};

/** 共通セクション枠。明るい白基調・広めの余白。 */
export function Section({
  children,
  dark,
  muted,
  id,
  className = "",
}: SectionProps) {
  const bg = dark
    ? "bg-matte text-white"
    : muted
      ? "bg-offwhite text-ink"
      : "bg-base text-ink";
  return (
    <section id={id} className={`${bg} ${className}`}>
      <div className="mx-auto max-w-content px-5 py-20 md:px-8 md:py-28">
        {children}
      </div>
    </section>
  );
}

type HeadingProps = {
  /** 欧文の小見出し（例 CONCEPT / POINT / GALLERY） */
  eyebrow?: string;
  title: string;
  lead?: string;
  dark?: boolean;
  /** 中央寄せ */
  center?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  dark,
  center,
}: HeadingProps) {
  return (
    <header
      className={`mb-12 max-w-3xl ${center ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && (
        <p
          className={`mb-4 text-xs font-semibold uppercase tracking-[0.25em] ${
            dark ? "text-white/60" : "text-accent"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-[1.75rem] font-bold leading-tight tracking-tight md:text-4xl ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-5 leading-loose ${
            dark ? "text-white/75" : "text-ink/70"
          }`}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
