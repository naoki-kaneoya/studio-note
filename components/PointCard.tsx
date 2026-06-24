type Props = {
  no: string;
  title: string;
  body: string;
  stats: string[];
};

/** トップ「3つの強み」カード。数値を強調表示する。 */
export default function PointCard({ no, title, body, stats }: Props) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-ink/10 bg-offwhite p-7">
      <p className="text-sm font-bold tracking-wide2 text-accent">{no}</p>
      <h3 className="mt-2 text-lg font-bold">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/80">{body}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {stats.map((s) => (
          <li
            key={s}
            className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent"
          >
            {s}
          </li>
        ))}
      </ul>
    </article>
  );
}
