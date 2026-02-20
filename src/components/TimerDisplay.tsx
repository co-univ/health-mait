"use client";

import { TimerPhase } from "@/types/timer";

interface TimerDisplayProps {
  remainingTime: number;
  progress: number;
  phase: TimerPhase;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case TimerPhase.WORK:
      return "운동 중";
    case TimerPhase.REST:
      return "휴식 중";
    case TimerPhase.COMPLETE:
      return "완료!";
    default:
      return "준비";
  }
}

function getPhaseColor(phase: TimerPhase): {
  stroke: string;
  text: string;
  glow: string;
} {
  switch (phase) {
    case TimerPhase.WORK:
      return {
        stroke: "stroke-lime-400",
        text: "text-lime-400",
        glow: "drop-shadow-[0_0_12px_rgba(163,230,53,0.4)]",
      };
    case TimerPhase.REST:
      return {
        stroke: "stroke-sky-400",
        text: "text-sky-400",
        glow: "drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]",
      };
    case TimerPhase.COMPLETE:
      return {
        stroke: "stroke-amber-400",
        text: "text-amber-400",
        glow: "drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]",
      };
    default:
      return {
        stroke: "stroke-zinc-600",
        text: "text-zinc-400",
        glow: "",
      };
  }
}

export default function TimerDisplay({
  remainingTime,
  progress,
  phase,
}: TimerDisplayProps) {
  const colors = getPhaseColor(phase);
  const isCountdown = phase !== TimerPhase.IDLE && remainingTime <= 3 && remainingTime > 0;

  const radius = 120;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={radius * 2}
        height={radius * 2}
        className={`-rotate-90 ${colors.glow}`}
      >
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800"
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colors.stroke} transition-all duration-300 ease-linear`}
        />
      </svg>

      <div className="absolute flex flex-col items-center gap-1">
        <span
          className={`text-5xl font-mono font-bold tabular-nums ${colors.text} ${
            isCountdown ? "animate-pulse" : ""
          }`}
        >
          {formatTime(remainingTime)}
        </span>
        <span className={`text-sm font-medium uppercase tracking-widest ${colors.text}`}>
          {getPhaseLabel(phase)}
        </span>
      </div>
    </div>
  );
}
