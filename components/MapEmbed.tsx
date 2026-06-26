import { SITE } from "@/lib/site";

/** アクセス地図。住所からGoogle Maps埋め込み（デザイン準拠：角丸＋淡いグレースケール）。 */
export default function MapEmbed({ ratio = "4/3" }: { ratio?: string }) {
  const q = encodeURIComponent(SITE.address.postalLine);
  return (
    <div
      style={{
        aspectRatio: ratio,
        borderRadius: 3,
        overflow: "hidden",
        background: "#eceae6",
      }}
    >
      <iframe
        title="Studio note アクセスマップ"
        src={`https://maps.google.com/maps?q=${q}&z=16&output=embed`}
        style={{ width: "100%", height: "100%", border: 0, filter: "grayscale(0.2)" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
