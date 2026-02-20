"use client";

import { useState } from "react";
import { TimerConfig } from "@/types/timer";

interface TimerSettingsProps {
  config: TimerConfig;
  onChange: (config: TimerConfig) => void;
  disabled: boolean;
}

function formatTimeDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${seconds}`;
}

function parseTimeInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes(":")) {
    const [mStr, sStr] = trimmed.split(":");
    const m = parseInt(mStr, 10);
    const s = parseInt(sStr || "0", 10);
    if (isNaN(m) || isNaN(s)) return null;
    return m * 60 + s;
  }

  const n = parseInt(trimmed, 10);
  if (isNaN(n)) return null;
  return n;
}

function TimeInput({
  label,
  value,
  onChange,
  disabled,
  min = 1,
  max = 3600,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  min?: number;
  max?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEditing = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const parsed = parseTimeInput(draft);
    if (parsed !== null) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - (value > 60 ? 30 : 5)))}
          disabled={disabled || value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400"
          aria-label="감소"
        >
          −
        </button>

        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            placeholder="초 또는 분:초"
            className="h-12 w-[80px] rounded-xl bg-zinc-800 px-3 text-center font-mono text-lg tabular-nums text-zinc-100 outline-none ring-2 ring-lime-400/60"
          />
        ) : (
          <button
            onClick={startEditing}
            disabled={disabled}
            className={`flex h-12 min-w-[80px] cursor-text items-center justify-center rounded-xl bg-zinc-800/50 px-3 font-mono text-lg tabular-nums transition-colors hover:bg-zinc-700/50 hover:ring-1 hover:ring-zinc-600 ${disabled ? "pointer-events-none opacity-50" : "text-zinc-100"}`}
          >
            {formatTimeDisplay(value)}
          </button>
        )}

        <button
          onClick={() => onChange(Math.min(max, value + (value >= 60 ? 30 : 5)))}
          disabled={disabled || value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400"
          aria-label="증가"
        >
          +
        </button>
      </div>
      <span className="text-[10px] text-zinc-600">
        클릭하여 직접 입력 (초 또는 분:초)
      </span>
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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEditing = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const n = parseInt(draft, 10);
    if (!isNaN(n)) {
      onChange(Math.max(1, Math.min(99, n)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
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
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400"
          aria-label="감소"
        >
          −
        </button>

        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            placeholder="세트"
            className="h-12 w-[80px] rounded-xl bg-zinc-800 px-3 text-center font-mono text-lg tabular-nums text-zinc-100 outline-none ring-2 ring-lime-400/60"
          />
        ) : (
          <button
            onClick={startEditing}
            disabled={disabled}
            className={`flex h-12 min-w-[80px] cursor-text items-center justify-center rounded-xl bg-zinc-800/50 px-3 font-mono text-lg tabular-nums transition-colors hover:bg-zinc-700/50 hover:ring-1 hover:ring-zinc-600 ${disabled ? "pointer-events-none opacity-50" : "text-zinc-100"}`}
          >
            {value}세트
          </button>
        )}

        <button
          onClick={() => onChange(Math.min(99, value + 1))}
          disabled={disabled || value >= 99}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400"
          aria-label="증가"
        >
          +
        </button>
      </div>
      <span className="text-[10px] text-zinc-600">클릭하여 직접 입력</span>
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
