"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const numberClass = "w-full min-w-0 rounded border border-slate-300 bg-white px-2 py-3 text-center font-mono text-[28px] font-semibold tabular-nums text-ink focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100";
const isNumberInRange = (value: string, max: number) => /^\d{1,2}$/.test(value) && Number(value) <= max;

export default function BookingTimeInput({ id, name, label, value, onChange }: Props) {
  const [hours, setHours] = useState(value.split(":")[0] || "");
  const [minutes, setMinutes] = useState(value.split(":")[1] || "00");
  const lastEmitted = useRef(value);

  useEffect(() => {
    // 入力中の一桁を維持し、空き枠の選択など外部からの変更だけを同期する。
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    setHours(value.split(":")[0] || "");
    setMinutes(value.split(":")[1] || "00");
  }, [value]);

  function update(nextHours: string, nextMinutes: string) {
    setHours(nextHours);
    setMinutes(nextMinutes);
    const nextValue = isNumberInRange(nextHours, 23) && isNumberInRange(nextMinutes, 59)
      ? `${nextHours.padStart(2, "0")}:${nextMinutes.padStart(2, "0")}` : "";
    lastEmitted.current = nextValue;
    onChange(nextValue);
  }

  const digits = (text: string) => text.normalize("NFKC").replace(/\D/g, "").slice(0, 2);
  const invalidHours = hours !== "" && !isNumberInRange(hours, 23);
  const invalidMinutes = minutes !== "" && !isNumberInRange(minutes, 59);

  return (
    <fieldset className="min-w-0 rounded border border-slate-200 bg-white p-4">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
        <div>
          <label htmlFor={`${id}-hours`} className="sr-only">{label}（時）</label>
          <input id={`${id}-hours`} name={`${name}Hours`} type="text" inputMode="numeric" autoComplete="off" maxLength={2} pattern="(?:[01]?[0-9]|2[0-3])" required placeholder="--" value={hours}
            onChange={(event) => update(digits(event.target.value), minutes)}
            onBlur={() => { if (isNumberInRange(hours, 23)) setHours(hours.padStart(2, "0")); }}
            aria-invalid={invalidHours || undefined} aria-describedby={invalidHours ? `${id}-error` : undefined} className={numberClass} />
          <span className="mt-1 block text-center text-xs text-slate-600">時</span>
        </div>
        <span aria-hidden="true" className="pt-3 font-mono text-[28px] text-slate-500">:</span>
        <div>
          <label htmlFor={`${id}-minutes`} className="sr-only">{label}（分）</label>
          <input id={`${id}-minutes`} name={`${name}Minutes`} type="text" inputMode="numeric" autoComplete="off" maxLength={2} pattern="[0-5]?[0-9]" required value={minutes}
            onChange={(event) => update(hours, digits(event.target.value))}
            onBlur={() => { if (isNumberInRange(minutes, 59)) setMinutes(minutes.padStart(2, "0")); }}
            aria-invalid={invalidMinutes || undefined} aria-describedby={invalidMinutes ? `${id}-error` : undefined} className={numberClass} />
          <span className="mt-1 block text-center text-xs text-slate-600">分</span>
        </div>
      </div>
      <div role="group" aria-label={`${label}の分を選ぶ`} className="mt-3 grid grid-cols-4 gap-2">
        {["00", "15", "30", "45"].map((minute) => <button key={minute} type="button" aria-pressed={isNumberInRange(minutes, 59) && minutes.padStart(2, "0") === minute} onClick={() => update(hours, minute)}
          className={`min-h-11 rounded border px-1 py-2 font-mono text-[16px] font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-400 ${isNumberInRange(minutes, 59) && minutes.padStart(2, "0") === minute ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-300 bg-white text-ink hover:bg-slate-50"}`}>{minute}<span className="ml-0.5 font-sans text-xs">分</span></button>)}
      </div>
      {(invalidHours || invalidMinutes) && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-red-800">時は0〜23、分は0〜59で入力してください。</p>}
    </fieldset>
  );
}
