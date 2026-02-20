"use client";

import { useState } from "react";
import { TimerConfig } from "@/types/timer";

interface TimerSettingsProps {
  config: TimerConfig;
  onChange: (config: TimerConfig) => void;
  disabled: boolean;
}

const inputClass =
  "h-12 w-14 rounded-xl bg-zinc-800 text-center font-mono text-lg tabular-nums text-zinc-100 outline-none focus:ring-2 focus:ring-lime-400/60 disabled:opacity-50";
const btnClass =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function TimeInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const mins = Math.floor(value / 60);
  const secs = value % 60;

  const [draftMin, setDraftMin] = useState<string | null>(null);
  const [draftSec, setDraftSec] = useState<string | null>(null);

  const commitMin = () => {
    if (draftMin === null) return;
    const n = parseInt(draftMin, 10);
    setDraftMin(null);
    if (isNaN(n)) return;
    const newTotal = clamp(n, 0, 59) * 60 + secs;
    onChange(Math.max(1, Math.min(3600, newTotal)));
  };

  const commitSec = () => {
    if (draftSec === null) return;
    const n = parseInt(draftSec, 10);
    setDraftSec(null);
    if (isNaN(n)) return;
    const newTotal = mins * 60 + clamp(n, 0, 59);
    onChange(Math.max(1, Math.min(3600, newTotal)));
  };

  const handleKeyDown = (commit: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") {
      setDraftMin(null);
      setDraftSec(null);
    }
  };

  const decrement = () => onChange(Math.max(1, value - (value > 60 ? 30 : 5)));
  const increment = () => onChange(Math.min(3600, value + (value >= 60 ? 30 : 5)));

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <button onClick={decrement} disabled={disabled || value <= 1} className={btnClass} aria-label="감소">
          −
        </button>

        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={draftMin !== null ? draftMin : String(mins)}
            onFocus={() => setDraftMin(String(mins))}
            onChange={(e) => setDraftMin(e.target.value)}
            onBlur={commitMin}
            onKeyDown={handleKeyDown(commitMin)}
            className={inputClass}
            aria-label={`${label} 분`}
          />
          <span className="text-lg font-bold text-zinc-500">:</span>
          <input
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={
              draftSec !== null
                ? draftSec
                : String(secs).padStart(2, "0")
            }
            onFocus={() => setDraftSec(String(secs))}
            onChange={(e) => setDraftSec(e.target.value)}
            onBlur={commitSec}
            onKeyDown={handleKeyDown(commitSec)}
            className={inputClass}
            aria-label={`${label} 초`}
          />
        </div>

        <button onClick={increment} disabled={disabled || value >= 3600} className={btnClass} aria-label="증가">
          +
        </button>
      </div>
      <span className="text-[10px] text-zinc-600">분 : 초</span>
    </div>
  );
}

function SetsInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const n = parseInt(draft, 10);
    setDraft(null);
    if (!isNaN(n)) onChange(clamp(n, 1, 99));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") setDraft(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        세트 수
      </label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={disabled || value <= 1}
          className={btnClass}
          aria-label="감소"
        >
          −
        </button>

        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={draft !== null ? draft : String(value)}
          onFocus={() => setDraft(String(value))}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={inputClass}
          aria-label="세트 수"
        />

        <button
          onClick={() => onChange(Math.min(99, value + 1))}
          disabled={disabled || value >= 99}
          className={btnClass}
          aria-label="증가"
        >
          +
        </button>
      </div>
      <span className="text-[10px] text-zinc-600">&nbsp;</span>
    </div>
  );
}

export default function TimerSettings({
  config,
  onChange,
  disabled,
}: TimerSettingsProps) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <TimeInput
        label="운동 시간"
        value={config.workTime}
        onChange={(v) => onChange({ ...config, workTime: v })}
        disabled={disabled}
      />
      <TimeInput
        label="휴식 시간"
        value={config.restTime}
        onChange={(v) => onChange({ ...config, restTime: v })}
        disabled={disabled}
      />
      <SetsInput
        value={config.totalSets}
        onChange={(v) => onChange({ ...config, totalSets: v })}
        disabled={disabled}
      />
    </div>
  );
}
