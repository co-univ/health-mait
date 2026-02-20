"use client";

import { useCallback, useRef } from "react";

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback(
    (frequency: number, duration: number, volume: number = 0.5) => {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    },
    [getAudioContext]
  );

  const playCountdownBeep = useCallback(() => {
    playBeep(800, 0.15, 0.4);
  }, [playBeep]);

  const playPhaseEndBeep = useCallback(() => {
    playBeep(1000, 0.5, 0.6);
  }, [playBeep]);

  const playCompleteBeep = useCallback(() => {
    playBeep(1200, 0.3, 0.6);
    setTimeout(() => playBeep(1200, 0.3, 0.6), 350);
    setTimeout(() => playBeep(1500, 0.5, 0.7), 700);
  }, [playBeep]);

  return { playCountdownBeep, playPhaseEndBeep, playCompleteBeep };
}
