import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  /** 黒マット背景（ビジュアルセクション用） */
  dark?: boolean;
  id?: string;
  className?: string;
};

/** 共通セクション枠。白＝情報、黒マット＝ビジュアルの対比をここで担保。 */
export function Section({ children, dark, id, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      className={`${dark ? "bg-matte text-white" : "bg-base text-ink"} ${className}`}
    >
      <div className="mx-auto max-w-content px-5 py-16 md:py-24">{children}</div>
    </section>
  );
}

type HeadingProps = {
  title: string;
  lead?: string;
  dark?: boolean;
};

export function SectionHeading({ title, lead, dark }: HeadingProps) {
  return (
    <header className="mb-10 max-w-3xl">
      <h2
        className={`text-2xl font-bold leading-snug md:text-3xl ${
          dark ? "text-white" : "text-accent"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-4 leading-relaxed ${
            dark ? "text-white/80" : "text-ink/80"
          }`}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
