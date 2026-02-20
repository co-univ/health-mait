export enum TimerPhase {
  IDLE = "IDLE",
  WORK = "WORK",
  REST = "REST",
  COMPLETE = "COMPLETE",
}

export interface TimerConfig {
  workTime: number;
  restTime: number;
  totalSets: number;
}

export interface TimerState {
  phase: TimerPhase;
  currentSet: number;
  remainingTime: number;
  isRunning: boolean;
}
