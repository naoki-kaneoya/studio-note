"use client";

import { useEffect, useRef, useState } from "react";
import { BOOKING_RESOURCES, NODA_LAST_BOOKING_DATE, isRangeAvailable, type BookingInput, type DayAvailability } from "@/lib/booking";
import BookingTimeInput from "@/components/BookingTimeInput";

type Receipt = { resourceName: string; name: string; email: string; date: string; startTime: string; endTime: string };
const inputClass = "w-full rounded border border-slate-300 bg-white px-3 py-3 text-[16px] text-ink disabled:bg-slate-100";

export default function BookingForm({ today, initialResource, ready }: { today: string; initialResource: "studio" | "noda"; ready: boolean }) {
  const [resource, setResource] = useState<"studio" | "noda">(initialResource);
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const pendingRequest = useRef<BookingInput | null>(null);
  const currentAvailability = availability?.resource === resource && availability.date === date ? availability : null;
  const selectedIsAvailable = isRangeAvailable(currentAvailability, startTime, endTime);

  useEffect(() => {
    setAvailability(null);
    setAvailabilityError("");
    if (!ready || !date || receipt) { setLoading(false); return; }
    let controller: AbortController;
    async function load() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      setLoading(true);
      setAvailabilityError("");
      try {
        const response = await fetch(`/api/availability?${new URLSearchParams({ resource, date })}`, { cache: "no-store", signal: request.signal });
        const result = await response.json();
        if (!response.ok || !result.ok || result.availability?.resource !== resource || result.availability?.date !== date) {
          throw new Error(result.message || "空き状況を取得できませんでした。");
        }
        if (!request.signal.aborted) setAvailability(result.availability);
      } catch (err) {
        if (!request.signal.aborted) {
          setAvailability(null);
          setAvailabilityError(err instanceof Error ? err.message : "空き状況を取得できませんでした。");
        }
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    return () => { controller?.abort(); window.clearInterval(timer); };
  }, [resource, date, ready, refresh, receipt]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    if (!uncertain) {
      if (!form.reportValidity()) return;
      if (!selectedIsAvailable || loading) {
        setError("空いている時間帯の中から開始・終了時間を選んでください。");
        return;
      }
      const data = new FormData(form);
      pendingRequest.current = {
        resource, date, startTime, endTime,
        name: String(data.get("name") || ""), email: String(data.get("email") || ""),
        requestId: crypto.randomUUID(),
      };
    }
    const payload = pendingRequest.current;
    if (!payload) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        // 登録結果が不明なら内容と送信IDを固定する。空き表示が変わっても再確認できる。
        const unknown = response.status >= 500;
        setUncertain(unknown);
        if (!unknown) pendingRequest.current = null;
        if (response.status === 409) setRefresh((value) => value + 1);
        setError(result.message || "予約を送信できませんでした。同じ内容でもう一度お試しください。");
        return;
      }
      setReceipt(result.booking);
      setUncertain(false);
      pendingRequest.current = null;
    } catch {
      setUncertain(true);
      setError("予約結果を確認できませんでした。入力を変えずに「予約結果を再確認する」を押してください。");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <section className="mt-8 rounded border border-emerald-200 bg-emerald-50 p-6" role="status">
        <h2 className="text-xl font-bold">予約を登録しました</h2>
        <p className="mt-4 font-medium">{receipt.resourceName}</p>
        <p className="mt-4">{receipt.date}　{receipt.startTime}〜{receipt.endTime}（日本時間）</p>
        <p className="mt-2">{receipt.name} 様</p>
        <p className="mt-4 leading-7">{receipt.email} にGoogleカレンダーの招待が届きます。メールが見当たらない場合は、迷惑メールフォルダもご確認ください。</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">変更・キャンセルは管理者へご連絡ください。招待への不参加の回答だけでは、施設の予約はキャンセルされません。</p>
        <button type="button" className="dc-btn dc-btn-outline mt-6" onClick={() => { setReceipt(null); setStartTime(""); setEndTime(""); setError(""); }}>別の予約をする</button>
      </section>
    );
  }

  return (
    <form className="mt-8" onSubmit={submit} onChange={() => { if (!uncertain) { pendingRequest.current = null; setError(""); } }}>
      {!ready && <p role="status" className="mb-6 rounded bg-amber-50 p-4 leading-7 text-amber-900">現在、予約受付の準備中です。利用をご希望の方は管理者にお問い合わせください。</p>}
      <fieldset disabled={submitting || uncertain || !ready} className="grid gap-6 border-0 p-0">
        <div>
          <label htmlFor="booking-resource" className="mb-2 block text-sm font-medium">利用する施設</label>
          <select id="booking-resource" name="resource" value={resource} onChange={(e) => { setResource(e.target.value as "studio" | "noda"); setStartTime(""); setEndTime(""); }} required className={inputClass}>
            {BOOKING_RESOURCES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <p className="mt-2 text-sm leading-6 text-slate-600">{resource === "studio" ? "庄内スタジオの利用時間は10:00〜20:00です。" : "野田小学校は2026年12月28日までご利用いただけます。"}</p>
        </div>
        <div>
          <label htmlFor="booking-date" className="mb-2 block text-sm font-medium">利用日</label>
          <input id="booking-date" name="date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setStartTime(""); setEndTime(""); }} min={today} max={resource === "noda" ? NODA_LAST_BOOKING_DATE : undefined} required className={inputClass} />
        </div>
        <section aria-labelledby="availability-heading" aria-busy={loading} className="rounded border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="availability-heading" className="font-bold">この日の空き時間</h2>
            <button type="button" disabled={loading || !date || !ready} onClick={() => setRefresh((value) => value + 1)} className="text-sm underline underline-offset-4 disabled:opacity-50">空き状況を更新</button>
          </div>
          <div aria-live="polite">
            {loading && <p className="mt-3 text-sm">空き状況を確認しています…</p>}
            {availabilityError && <p role="alert" className="mt-3 text-sm text-red-800">{availabilityError}「空き状況を更新」から再度お試しください。</p>}
            {currentAvailability && !loading && <>
              {currentAvailability.available.length ? <>
                <p className="mt-3 text-sm leading-6">空いている時間帯を選び、下の開始・終了時間を調整してください。</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentAvailability.available.map((range) => <button key={range.startTime} type="button" onClick={() => { setStartTime(range.startTime); setEndTime(range.endTime); }} className="rounded border border-emerald-300 bg-white px-4 py-3 font-medium text-emerald-800 hover:bg-emerald-50">{range.startTime}〜{range.endTime}</button>)}
                </div>
              </> : <p className="mt-3 font-medium">この日に予約できる空き時間はありません。別の日付を選んでください。</p>}
              {currentAvailability.busy.length > 0 && <p className="mt-4 text-sm leading-6 text-slate-600">予約済み：{currentAvailability.busy.map((range) => `${range.startTime}〜${range.endTime}`).join("、")}</p>}
              <p className="mt-4 text-xs leading-5 text-slate-500">{new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(currentAvailability.checkedAt))} 確認・1分ごとに更新。表示は日本時間です。送信時にもう一度空き状況を確認します。</p>
            </>}
          </div>
        </section>
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <BookingTimeInput key={`${resource}:${date}:start`} id="booking-start" name="startTime" label="開始時間" value={startTime} onChange={setStartTime} />
            <BookingTimeInput key={`${resource}:${date}:end`} id="booking-end" name="endTime" label="終了時間" value={endTime} onChange={setEndTime} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">24時間表記です。数字を直接入力するか、分のボタンを選んでください。1分単位で指定できます。</p>
        </div>
        {selectedIsAvailable && <p aria-live="polite" className="rounded bg-slate-50 p-4 text-center"><span className="block text-sm text-slate-600">選択した利用時間</span><strong className="mt-1 block font-mono text-2xl tabular-nums">{startTime}〜{endTime}</strong></p>}
        {startTime && endTime && currentAvailability && !selectedIsAvailable && <p role="alert" className="text-sm text-red-800">この時間には予約できません。表示された空き時間の中で選んでください。</p>}
        <div>
          <label htmlFor="booking-name" className="mb-2 block text-sm font-medium">お名前</label>
          <input id="booking-name" name="name" type="text" autoComplete="name" maxLength={80} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="booking-email" className="mb-2 block text-sm font-medium">メールアドレス</label>
          <input id="booking-email" name="email" type="email" autoComplete="email" maxLength={254} required aria-describedby="booking-email-help" className={inputClass} />
          <p id="booking-email-help" className="mt-2 text-sm text-slate-600">Googleカレンダーの招待を受け取るアドレスです。</p>
        </div>
        <p className="text-sm leading-6 text-slate-600">すべて必須です。時間は日本時間で、同じ日の開始・終了時間を指定してください。入力内容は予約管理と招待の送信に使用します。</p>
      </fieldset>
      {error && <p role="alert" className="mt-5 rounded bg-red-50 p-4 leading-7 text-red-800">{error}</p>}
      {uncertain && <p className="mt-3 text-sm leading-6 text-slate-600">予約が登録済みでも、同じ内容の再確認で予定や招待が増えることはありません。</p>}
      <button type="submit" disabled={!ready || submitting || (!uncertain && (loading || !selectedIsAvailable))} className="dc-btn dc-btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "空き状況を確認して予約中…" : uncertain ? "予約結果を再確認する" : "予約して招待を受け取る"}</button>
    </form>
  );
}
