import Image from "next/image";

type Props = {
  title: string;
  body: string;
  /** 作例画像（未指定ならプレースホルダ表示） */
  image?: string;
};

/** 用途タイル。明るい白基調・写真主体。 */
export default function UseCaseTile({ title, body, image }: Props) {
  return (
    <article className="group">
      <div className="overflow-hidden rounded-lg bg-offwhite">
        {image ? (
          <div className="aspect-[4/5] overflow-hidden">
            <Image
              src={image}
              alt={title}
              width={600}
              height={750}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center text-xs text-ink/30">
            作例写真
          </div>
        )}
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/65">{body}</p>
    </article>
  );
}
