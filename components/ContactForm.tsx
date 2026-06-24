"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/gtag";

const GENRES = ["物撮り", "ポートレート/宣材", "映像", "その他"];
const PLACES = ["スタジオ", "出張", "未定"];

const labelCls = "block text-sm font-bold text-ink";
const inputCls =
  "mt-1 w-full rounded-md border border-ink/20 bg-base px-3 py-2 text-sm focus:border-accent focus:outline-none";

export default function ContactForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(json?.message || "送信に失敗しました。");
      }
      trackEvent("contact_submit", { genre: data.genre });
      router.push("/thanks");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "送信に失敗しました。時間をおいて再度お試しください。"
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* ハニーポット（スパム対策・非表示） */}
      <div className="hidden" aria-hidden="true">
        <label>
          ご記入不要
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="company">
            会社名 <span className="text-accent">*</span>
          </label>
          <input id="company" name="company" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="name">
            ご担当者名 <span className="text-accent">*</span>
          </label>
          <input id="name" name="name" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">
            メールアドレス <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="tel">
            電話番号（任意）
          </label>
          <input id="tel" name="tel" type="tel" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="genre">
            撮影ジャンル <span className="text-accent">*</span>
          </label>
          <select id="genre" name="genre" required className={inputCls} defaultValue="">
            <option value="" disabled>
              選択してください
            </option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="place">
            撮影場所 <span className="text-accent">*</span>
          </label>
          <select id="place" name="place" required className={inputCls} defaultValue="">
            <option value="" disabled>
              選択してください
            </option>
            {PLACES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="period">
            希望時期
          </label>
          <input id="period" name="period" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="budget">
            ご予算感（任意）
          </label>
          <input id="budget" name="budget" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="message">
          内容・ご相談 <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className={inputCls}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-bold tracking-wide2 text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {submitting ? "送信中…" : "送信する"}
      </button>
    </form>
  );
}
