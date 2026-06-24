import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/Section";
import { UPNOW_STUDIO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "利用規約・キャンセルポリシー",
  description:
    "Studio note の利用規約・キャンセルポリシー。キャンセル・日時変更および取消料はUpnowの定めるキャンセルポリシーによります。",
};

// 本文は枠のみ（後日流し込み）。見出し構成だけ用意する。
const SECTIONS = [
  { heading: "1. 予約について", body: "" },
  { heading: "2. 料金・支払い", body: "" },
  {
    heading: "3. キャンセル・日時変更について",
    body: "キャンセル・日時変更および取消料は、予約サイト「Upnow」の定めるキャンセルポリシーによります。",
    link: true,
  },
  { heading: "4. 利用上のルール", body: "" },
  { heading: "5. 原状復帰・清掃", body: "" },
  { heading: "6. 機材・設備の利用", body: "" },
  { heading: "7. 防犯・安全", body: "" },
  { heading: "8. 免責事項", body: "" },
  { heading: "9. 規約の変更", body: "" },
];

export default function TermsPage() {
  return (
    <Section>
      <SectionHeading title="利用規約・キャンセルポリシー" />
      <div className="max-w-3xl space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.heading}>
            <h2 className="text-lg font-bold text-accent">{s.heading}</h2>
            {s.body ? (
              <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {s.body}
                {s.link && (
                  <>
                    {" "}
                    <a
                      href={UPNOW_STUDIO_URL}
                      target="_blank"
                      rel="noopener"
                      className="text-accent underline underline-offset-4"
                    >
                      Upnowのキャンセルポリシーを確認する
                    </a>
                  </>
                )}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink/40">（本文は準備中です）</p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
