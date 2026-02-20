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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playCountdownBeep, playPhaseEndBeep, playCompleteBeep } = useSound();

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.phase === TimerPhase.IDLE) {
        return {
          phase: TimerPhase.WORK,
          currentSet: 1,
          remainingTime: config.workTime,
          isRunning: true,
        };
      }
      if (prev.phase === TimerPhase.COMPLETE) {
        return prev;
      }
      return { ...prev, isRunning: true };
    });
  }, [config.workTime]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setState(INITIAL_STATE);
  }, [clearTimer]);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.isRunning) {
        return { ...prev, isRunning: false };
      }
      if (prev.phase === TimerPhase.IDLE) {
        return {
          phase: TimerPhase.WORK,
          currentSet: 1,
          remainingTime: config.workTime,
          isRunning: true,
        };
      }
      if (prev.phase === TimerPhase.COMPLETE) {
        return prev;
      }
      return { ...prev, isRunning: true };
    });
  }, [config.workTime]);

  useEffect(() => {
    if (!state.isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.isRunning) return prev;

        const newRemaining = prev.remainingTime - 1;

        if (newRemaining > 0 && newRemaining <= 3) {
          playCountdownBeep();
        }

        if (newRemaining <= 0) {
          if (prev.phase === TimerPhase.WORK) {
            if (prev.currentSet >= config.totalSets) {
              playCompleteBeep();
              return {
                phase: TimerPhase.COMPLETE,
                currentSet: prev.currentSet,
                remainingTime: 0,
                isRunning: false,
              };
            }
            playPhaseEndBeep();
            return {
              phase: TimerPhase.REST,
              currentSet: prev.currentSet,
              remainingTime: config.restTime,
              isRunning: true,
            };
          }

          if (prev.phase === TimerPhase.REST) {
            playPhaseEndBeep();
            return {
              phase: TimerPhase.WORK,
              currentSet: prev.currentSet + 1,
              remainingTime: config.workTime,
              isRunning: true,
            };
          }

          return prev;
        }

        return { ...prev, remainingTime: newRemaining };
      });
    }, 1000);

    return () => clearTimer();
  }, [
    state.isRunning,
    config.workTime,
    config.restTime,
    config.totalSets,
    clearTimer,
    playCountdownBeep,
    playPhaseEndBeep,
    playCompleteBeep,
  ]);

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
    start,
    pause,
    reset,
    toggle,
  };
}
