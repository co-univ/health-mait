"use client";

import { useEffect, useState } from "react";
import { TimerConfig, TimerPhase } from "@/types/timer";
import { useTimer } from "@/hooks/useTimer";
import { useWakeLock } from "@/hooks/useWakeLock";
import TimerDisplay from "@/components/TimerDisplay";
import TimerControls from "@/components/TimerControls";
import TimerSettings from "@/components/TimerSettings";
import SetIndicator from "@/components/SetIndicator";

const DEFAULT_CONFIG: TimerConfig = {
  workTime: 180,
  restTime: 30,
  totalSets: 3,
};

export default function Home() {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const { state, progress, toggle, reset } = useTimer(config);
  const wakeLock = useWakeLock();

  const isActive = state.phase !== TimerPhase.IDLE;

  useEffect(() => {
    if (state.isRunning) {
      wakeLock.request();
    } else {
      wakeLock.release();
    }
  }, [state.isRunning, wakeLock]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <header className="mb-10">
        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-100">
          운동 메이트
        </h1>
        <p className="mt-1 text-center text-sm text-zinc-500">
          세트 기반 운동 타이머
        </p>
      </header>

      <main className="flex w-full max-w-sm flex-col items-center gap-8">
        <TimerDisplay
          remainingTime={state.remainingTime}
          progress={progress}
          phase={state.phase}
        />

        <SetIndicator
          currentSet={state.currentSet}
          totalSets={config.totalSets}
          phase={state.phase}
        />

        <TimerControls
          phase={state.phase}
          isRunning={state.isRunning}
          onToggle={toggle}
          onReset={reset}
        />

        <div
          className={`w-full transition-opacity duration-300 ${isActive ? "pointer-events-none opacity-40" : "opacity-100"}`}
        >
          <TimerSettings
            config={config}
            onChange={setConfig}
            disabled={isActive}
          />
        </div>
      </main>
    </div>
  );
}
