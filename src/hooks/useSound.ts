"use client";

import { useCallback, useRef } from "react";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function createSilentWavBlob(): Blob {
  const sampleRate = 8000;
  const numSamples = sampleRate; // 1초
  const byteRate = sampleRate;
  const dataSize = numSamples;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < dataSize; i++) view.setUint8(44 + i, 128); // 8-bit silence

  return new Blob([buffer], { type: "audio/wav" });
}

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);
  const keepAliveAudioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // 사용자 제스처(터치/클릭) 핸들러 안에서 반드시 호출
  const initAudioContext = useCallback(() => {
    const ctx = getAudioContext();

    if (!unlockedRef.current) {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      unlockedRef.current = true;
    }
  }, [getAudioContext]);

  // 무음 오디오 루프로 iOS/Android 백그라운드 JS suspension 방지
  const startKeepAlive = useCallback(() => {
    if (keepAliveAudioRef.current) return;

    const blob = createSilentWavBlob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.01;
    audio.play().catch(() => {});
    keepAliveAudioRef.current = audio;
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveAudioRef.current) {
      keepAliveAudioRef.current.pause();
      keepAliveAudioRef.current.src = "";
      keepAliveAudioRef.current = null;
    }
  }, []);

  const playBeep = useCallback(
    (frequency: number, duration: number, volume: number = 0.5) => {
      try {
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
      } catch {
        // Web Audio API 실패 시 무시 (진동으로 대체)
      }
    },
    [getAudioContext]
  );

  const playCountdownBeep = useCallback(() => {
    playBeep(800, 0.15, 0.4);
    vibrate(50);
  }, [playBeep]);

  const playPhaseEndBeep = useCallback(() => {
    playBeep(1000, 0.5, 0.6);
    vibrate([100, 50, 100]);
  }, [playBeep]);

  const playCompleteBeep = useCallback(() => {
    playBeep(1200, 0.3, 0.6);
    setTimeout(() => playBeep(1200, 0.3, 0.6), 350);
    setTimeout(() => playBeep(1500, 0.5, 0.7), 700);
    vibrate([200, 100, 200, 100, 300]);
  }, [playBeep]);

  return {
    initAudioContext,
    startKeepAlive,
    stopKeepAlive,
    playCountdownBeep,
    playPhaseEndBeep,
    playCompleteBeep,
  };
}
