"use client";

import { TimerPhase } from "@/types/timer";

interface SetIndicatorProps {
  currentSet: number;
  totalSets: number;
  phase: TimerPhase;
}

export default function SetIndicator({
  currentSet,
  totalSets,
  phase,
}: SetIndicatorProps) {
  if (phase === TimerPhase.IDLE) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSets }, (_, i) => {
          const setNum = i + 1;
          const isComplete =
            phase === TimerPhase.COMPLETE
              ? true
              : setNum < currentSet;
          const isCurrent = setNum === currentSet && phase !== TimerPhase.COMPLETE;

          return (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                isComplete
                  ? "bg-lime-400 scale-100"
                  : isCurrent
                    ? "bg-lime-400 scale-125 animate-pulse"
                    : "bg-zinc-700"
              }`}
            />
          );
        })}
      </div>
      <span className="text-sm tabular-nums text-zinc-500">
        {phase === TimerPhase.COMPLETE
          ? `${totalSets}세트 완료`
          : `${currentSet} / ${totalSets} 세트`}
      </span>
    </div>
  );
}
