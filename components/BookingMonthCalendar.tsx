"use client";

import { useEffect, useState } from "react";
import { NODA_LAST_BOOKING_DATE, shiftBookingMonth, type BookingInput, type MonthAvailability } from "@/lib/booking";

type Props = { resource: BookingInput["resource"]; date: string; today: string; ready: boolean; refresh: number; onSelectDate: (date: string) => void; onRefresh: () => void };
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const minute = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const dateLabel = (date: string) => new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T00:00:00+09:00`));

export default function BookingMonthCalendar({ resource, date, today, ready, refresh, onSelectDate, onRefresh }: Props) {
  const month = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.slice(0, 7) : today.slice(0, 7);
  const [data, setData] = useState<MonthAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const current = data?.resource === resource && data.month === month ? data : null;
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(`${month}-01T00:00:00Z`);
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const offset = first.getUTCDay();
  const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day < 1 || day > count ? null : `${month}-${String(day).padStart(2, "0")}`;
  });
  const opens = resource === "studio" ? 600 : 0;
  const closes = resource === "studio" ? 1200 : 1439;

  useEffect(() => {
    setData(null);
    setError("");
    if (!ready) { setLoading(false); return; }
    let controller: AbortController;
    async function load() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      setData(null);
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/availability/month?${new URLSearchParams({ resource, month })}`, { cache: "no-store", signal: request.signal });
        const result = await response.json();
        if (!response.ok || !result.ok || result.availability?.resource !== resource || result.availability?.month !== month || !Array.isArray(result.availability.days)) {
          throw new Error(result.message || "月の予約状況を取得できませんでした。");
        }
        if (!request.signal.aborted) setData(result.availability);
      } catch (err) {
        if (!request.signal.aborted) { setData(null); setError(err instanceof Error ? err.message : "月の予約状況を取得できませんでした。"); }
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 300000);
    return () => { controller?.abort(); window.clearInterval(timer); };
  }, [resource, month, ready, refresh]);

  function moveMonth(offset: number) {
    const target = shiftBookingMonth(month, offset);
    onSelectDate(target === today.slice(0, 7) ? today : `${target}-01`);
  }

  return (
    <section aria-labelledby="month-calendar-heading" aria-busy={loading} className="rounded border border-slate-200 bg-white p-3 sm:p-5">
      <h2 id="month-calendar-heading" className="font-bold">1か月の予約状況</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">日付を押すと、下に詳しい空き時間が表示されます。「予約あり」の日も、空いている時間に予約できます。</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button type="button" aria-label="前の月" disabled={month <= today.slice(0, 7)} onClick={() => moveMonth(-1)} className="min-h-11 min-w-11 rounded border border-slate-200 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-30">‹</button>
        <p className="text-lg font-bold tabular-nums" aria-live="polite">{year}年{monthNumber}月</p>
        <button type="button" aria-label="次の月" disabled={resource === "noda" && month >= NODA_LAST_BOOKING_DATE.slice(0, 7)} onClick={() => moveMonth(1)} className="min-h-11 min-w-11 rounded border border-slate-200 text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-30">›</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-600" />空きあり</span>
          <span className="flex items-center gap-1"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-600" />予約あり</span>
          <span className="flex items-center gap-1"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-slate-600" />空きなし</span>
        </div>
        <button type="button" onClick={() => onSelectDate(today)} className="min-h-11 px-2 underline underline-offset-4">今月へ</button>
      </div>
      <table className="mt-2 w-full table-fixed border-separate border-spacing-1">
        <caption className="sr-only">{year}年{monthNumber}月の施設予約状況</caption>
        <thead><tr>{weekdays.map((day, index) => <th scope="col" key={day} className={`py-2 text-xs font-medium ${index === 0 ? "text-red-700" : index === 6 ? "text-blue-700" : "text-slate-500"}`}>{day}</th>)}</tr></thead>
        <tbody>{Array.from({ length: cells.length / 7 }, (_, row) => <tr key={row}>{cells.slice(row * 7, row * 7 + 7).map((cell, column) => {
          if (!cell) return <td key={column} />;
          const item = current?.days.find(item => item.date === cell);
          const past = cell < today;
          const closed = resource === "noda" && cell > NODA_LAST_BOOKING_DATE;
          const availability = item?.status === "open" ? item.availability : null;
          const state = past || closed ? "終了" : !availability ? "—" : !availability.available.length ? "空きなし" : availability.busy.length ? "予約あり" : "空きあり";
          const [label, suffix] = state === "終了" || state === "—" ? [state, ""] : state === "予約あり" ? ["予約", "あり"] : ["空き", state === "空きあり" ? "あり" : "なし"];
          const color = past || closed ? "border-slate-100 bg-slate-50 text-slate-400" : !availability ? "border-slate-200 text-slate-500" : !availability.available.length ? "border-slate-300 bg-slate-100 text-slate-700" : availability.busy.length ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900";
          const selected = cell === date;
          return <td key={cell} className="p-0 align-top">
            <button type="button" id={`booking-calendar-${cell}`} disabled={past || closed} aria-pressed={selected} aria-current={cell === today ? "date" : undefined} aria-label={`${dateLabel(cell)} ${state}${selected ? " 選択中" : ""}`} tabIndex={selected || (!date && cell === today) ? 0 : -1} onClick={() => onSelectDate(cell)} onKeyDown={(event) => {
              const delta = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[event.key];
              if (!delta) return;
              event.preventDefault();
              const next = new Date(Date.parse(`${cell}T00:00:00Z`) + delta * 86400000).toISOString().slice(0, 10);
              if (next < today || (resource === "noda" && next > NODA_LAST_BOOKING_DATE)) return;
              onSelectDate(next);
              requestAnimationFrame(() => document.getElementById(`booking-calendar-${next}`)?.focus());
            }} className={`min-h-[88px] w-full min-w-0 rounded border px-1 py-2 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent min-[480px]:min-h-[76px] ${color} ${selected ? "ring-2 ring-accent ring-offset-1" : ""}`}>
              <span className="block text-[18px] font-bold leading-5 tabular-nums">{Number(cell.slice(8))}</span>
              <span className="mt-1 block min-h-8 text-[10px] leading-4 min-[480px]:min-h-4 sm:text-xs"><span className="block min-[480px]:inline">{label}</span><span className="block min-[480px]:inline">{suffix}</span></span>
              <span aria-hidden="true" className={`relative mt-2 block h-1.5 overflow-hidden rounded-full ${availability ? "bg-emerald-100" : "bg-slate-100"}`}>
                {availability?.busy.map(range => <span key={range.startTime} className="absolute inset-y-0 bg-amber-500" style={{ left: `${(minute(range.startTime) - opens) / (closes - opens) * 100}%`, width: `${(minute(range.endTime) - minute(range.startTime)) / (closes - opens) * 100}%` }} />)}
              </span>
            </button>
          </td>;
        })}</tr>)}</tbody>
      </table>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs leading-5 text-slate-500">
        <p>{resource === "studio" ? "バーは10:00〜20:00の予約済み時間" : "バーは0:00〜23:59の予約済み時間"}</p>
        <button type="button" disabled={loading || !ready} onClick={onRefresh} className="min-h-11 px-2 text-slate-700 underline underline-offset-4 disabled:opacity-50">月の状況を更新</button>
      </div>
      <div aria-live="polite" className="mt-3 text-sm leading-6">
        {loading && <p className="text-slate-600">月の予約状況を確認しています…</p>}
        {error && <p role="alert" className="text-red-800">{error}</p>}
        {current && !loading && <p className="text-xs text-slate-500">{new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" }).format(new Date(current.checkedAt))} 確認・5分ごとに更新。過去の日付は受付終了です。</p>}
      </div>
    </section>
  );
}
