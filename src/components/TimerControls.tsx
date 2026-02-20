"use client";

import { TimerPhase } from "@/types/timer";

interface TimerControlsProps {
  phase: TimerPhase;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function TimerControls({
  phase,
  isRunning,
  onToggle,
  onReset,
}: TimerControlsProps) {
  const isIdle = phase === TimerPhase.IDLE;
  const isComplete = phase === TimerPhase.COMPLETE;

  return (
    <div className="flex items-center gap-4">
      {!isComplete && (
        <button
          onClick={onToggle}
          className={`flex h-14 w-36 items-center justify-center rounded-2xl text-lg font-semibold transition-all active:scale-95 ${
            isRunning
              ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
              : isIdle
                ? "bg-lime-500 text-zinc-900 hover:bg-lime-400"
                : "bg-lime-500 text-zinc-900 hover:bg-lime-400"
          }`}
        >
          {isRunning ? "일시정지" : isIdle ? "시작" : "재개"}
        </button>
      )}

      {!isIdle && (
        <button
          onClick={onReset}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 transition-all hover:bg-zinc-700 hover:text-zinc-200 active:scale-95"
          aria-label="리셋"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 1 3.5-7.1" />
            <path d="M3 4v5h5" />
          </svg>
        </button>
      )}
    </div>
  );
}
