import Image from "next/image";

type Props = {
  title: string;
  body: string;
  /** 作例画像（未指定ならプレースホルダ表示） */
  image?: string;
};

/** 用途タイル（黒マット背景に並べる）。 */
export default function UseCaseTile({ title, body, image }: Props) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
      {image ? (
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={600}
            height={450}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-white/5 text-xs text-white/40">
          作例写真
        </div>
      )}
      <div className="p-5">
        <h3 className="font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
      </div>
    </article>
  );
}
