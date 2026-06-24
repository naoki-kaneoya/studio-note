type Props = {
  no: string;
  title: string;
  body: string;
  stats: string[];
};

/** トップ「3つの強み」カード。Point番号を大きく見せる明るい構成。 */
export default function PointCard({ no, title, body, stats }: Props) {
  return (
    <article className="flex h-full flex-col border-t border-ink/15 pt-6">
      <p className="font-serif text-sm tracking-[0.2em] text-accent">
        POINT <span className="text-2xl align-middle">{no}</span>
      </p>
      <h3 className="mt-4 text-lg font-bold leading-snug">{title}</h3>
      <p className="mt-4 flex-1 text-sm leading-loose text-ink/70">{body}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {stats.map((s) => (
          <li
            key={s}
            className="rounded-full border border-accent/30 px-3 py-1 text-xs font-medium text-accent"
          >
            {s}
          </li>
        ))}
      </ul>
    </article>
  );
}
