import { SITE } from "@/lib/site";

/** アクセス地図。住所からGoogle Maps埋め込み。 */
export default function MapEmbed() {
  const q = encodeURIComponent(SITE.address.postalLine);
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10">
      <iframe
        title="Studio note アクセスマップ"
        src={`https://maps.google.com/maps?q=${q}&output=embed`}
        className="h-[320px] w-full md:h-[400px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
