"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TimerConfig, TimerPhase, TimerState } from "@/types/timer";
import { useSound } from "./useSound";

const INITIAL_STATE: TimerState = {
  phase: TimerPhase.IDLE,
  currentSet: 1,
  remainingTime: 0,
  isRunning: false,
};

export function useTimer(config: TimerConfig) {
  const [state, setState] = useState<TimerState>(INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseEndTimeRef = useRef(0);
  const phaseRef = useRef<TimerPhase>(TimerPhase.IDLE);
  const setRef = useRef(1);
  const runningRef = useRef(false);
  const lastBeepedSecRef = useRef(-1);

  const configRef = useRef(config);
  configRef.current = config;

  const {
    initAudioContext,
    startKeepAlive,
    stopKeepAlive,
    playCountdownBeep,
    playPhaseEndBeep,
    playCompleteBeep,
  } = useSound();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current) return;

    const cfg = configRef.current;
    let phase = phaseRef.current;
    let currentSet = setRef.current;
    let endTime = phaseEndTimeRef.current;
    const now = Date.now();
    let soundToPlay: "countdown" | "phaseEnd" | "complete" | null = null;

    while (now >= endTime && phase !== TimerPhase.COMPLETE) {
      if (phase === TimerPhase.WORK) {
        if (currentSet >= cfg.totalSets) {
          phase = TimerPhase.COMPLETE;
          soundToPlay = "complete";
          break;
        }
        phase = TimerPhase.REST;
        endTime += cfg.restTime * 1000;
        soundToPlay = "phaseEnd";
      } else if (phase === TimerPhase.REST) {
        phase = TimerPhase.WORK;
        currentSet++;
        endTime += cfg.workTime * 1000;
        soundToPlay = "phaseEnd";
      }
    }

    const remaining =
      phase === TimerPhase.COMPLETE
        ? 0
        : Math.max(0, Math.ceil((endTime - now) / 1000));

    const isComplete = phase === TimerPhase.COMPLETE;

    if (document.visibilityState === "visible") {
      if (soundToPlay === "complete") {
        playCompleteBeep();
      } else if (soundToPlay === "phaseEnd") {
        playPhaseEndBeep();
      } else if (remaining > 0 && remaining <= 3 && lastBeepedSecRef.current !== remaining) {
        playCountdownBeep();
      }
    }
    lastBeepedSecRef.current = remaining;

    phaseRef.current = phase;
    setRef.current = currentSet;
    phaseEndTimeRef.current = endTime;

    if (isComplete) {
      runningRef.current = false;
      stopKeepAlive();
    }

    setState({
      phase,
      currentSet,
      remainingTime: remaining,
      isRunning: !isComplete,
    });
  }, [playCountdownBeep, playPhaseEndBeep, playCompleteBeep, stopKeepAlive]);

  const startInterval = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(tick, 250);
  }, [clearTimer, tick]);

  const toggle = useCallback(() => {
    initAudioContext();

    if (runningRef.current) {
      // 일시정지: 남은 밀리초를 보존
      runningRef.current = false;
      clearTimer();
      stopKeepAlive();
      const remaining = Math.max(0, phaseEndTimeRef.current - Date.now());
      phaseEndTimeRef.current = remaining; // 임시로 남은 ms 저장
      setState((prev) => ({ ...prev, isRunning: false }));
      return;
    }

    if (phaseRef.current === TimerPhase.COMPLETE) return;

    if (phaseRef.current === TimerPhase.IDLE) {
      phaseRef.current = TimerPhase.WORK;
      setRef.current = 1;
      phaseEndTimeRef.current = Date.now() + config.workTime * 1000;
      lastBeepedSecRef.current = -1;
    } else {
      // 재개: 보존된 남은 ms로 endTime 복원
      phaseEndTimeRef.current = Date.now() + phaseEndTimeRef.current;
    }

    runningRef.current = true;
    startKeepAlive();
    startInterval();

    setState({
      phase: phaseRef.current,
      currentSet: setRef.current,
      remainingTime: Math.ceil(
        (phaseEndTimeRef.current - Date.now()) / 1000
      ),
      isRunning: true,
    });
  }, [config.workTime, initAudioContext, clearTimer, startKeepAlive, stopKeepAlive, startInterval]);

  const reset = useCallback(() => {
    clearTimer();
    runningRef.current = false;
    phaseRef.current = TimerPhase.IDLE;
    setRef.current = 1;
    phaseEndTimeRef.current = 0;
    lastBeepedSecRef.current = -1;
    stopKeepAlive();
    setState(INITIAL_STATE);
  }, [clearTimer, stopKeepAlive]);

  // visibilitychange: 탭이 다시 보이면 즉시 타이머 상태 재계산
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && runningRef.current) {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [tick]);

  // isRunning이 true인 동안 interval 유지
  useEffect(() => {
    if (state.isRunning) {
      startInterval();
      return () => clearTimer();
    }
  }, [state.isRunning, startInterval, clearTimer]);

  // cleanup
  useEffect(() => {
    return () => {
      clearTimer();
      stopKeepAlive();
    };
  }, [clearTimer, stopKeepAlive]);

  const totalTime =
    state.phase === TimerPhase.WORK
      ? config.workTime
      : state.phase === TimerPhase.REST
        ? config.restTime
        : 0;

  const progress = totalTime > 0 ? state.remainingTime / totalTime : 0;

  return {
    state,
    progress,
    totalTime,
    toggle,
    reset,
  };
}
