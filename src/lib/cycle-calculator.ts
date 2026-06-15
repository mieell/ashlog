// AshLog — Cycle Calculator
// Predicts cycle phases, next period, ovulation window from historical data

import { differenceInDays, addDays, format } from "date-fns";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface CycleInfo {
  currentDay: number;
  currentPhase: CyclePhase;
  phaseLabel: string;
  nextPeriodDate: Date;
  daysUntilPeriod: number;
  ovulationWindowStart: Date;
  ovulationWindowEnd: Date;
  averageCycleLength: number;
  isRegular: boolean;
}

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

const PHASE_DESCRIPTIONS: Record<CyclePhase, string> = {
  menstrual: "Your body is shedding the uterine lining. Rest and self-care are especially important.",
  follicular: "Estrogen is rising. Energy and mood tend to improve during this phase.",
  ovulation: "Peak fertility window. You may notice increased energy and positive mood.",
  luteal: "Progesterone rises. You might experience PMS symptoms towards the end.",
};

export function getPhaseDescription(phase: CyclePhase): string {
  return PHASE_DESCRIPTIONS[phase];
}

export function calculateAverageCycleLength(cycleLengths: number[]): number {
  if (cycleLengths.length === 0) return 28; // default
  const sum = cycleLengths.reduce((a, b) => a + b, 0);
  return Math.round(sum / cycleLengths.length);
}

export function isCycleRegular(cycleLengths: number[]): boolean {
  if (cycleLengths.length < 3) return true; // not enough data
  const avg = calculateAverageCycleLength(cycleLengths);
  return cycleLengths.every((len) => Math.abs(len - avg) <= 5);
}

export function getCurrentPhase(
  cycleDay: number,
  cycleLength: number = 28
): CyclePhase {
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= Math.floor(cycleLength * 0.5) - 2) return "follicular";
  if (cycleDay <= Math.floor(cycleLength * 0.5) + 2) return "ovulation";
  return "luteal";
}

export function calculateCycleInfo(
  lastPeriodStart: Date,
  cycleLengths: number[] = []
): CycleInfo {
  const avgLength = calculateAverageCycleLength(cycleLengths);
  const today = new Date();
  const currentDay = differenceInDays(today, lastPeriodStart) + 1;
  const currentPhase = getCurrentPhase(currentDay, avgLength);

  const nextPeriodDate = addDays(lastPeriodStart, avgLength);
  const daysUntilPeriod = Math.max(0, differenceInDays(nextPeriodDate, today));

  const ovulationDay = Math.floor(avgLength / 2);
  const ovulationWindowStart = addDays(lastPeriodStart, ovulationDay - 2);
  const ovulationWindowEnd = addDays(lastPeriodStart, ovulationDay + 2);

  return {
    currentDay: Math.max(1, currentDay),
    currentPhase,
    phaseLabel: PHASE_LABELS[currentPhase],
    nextPeriodDate,
    daysUntilPeriod,
    ovulationWindowStart,
    ovulationWindowEnd,
    averageCycleLength: avgLength,
    isRegular: isCycleRegular(cycleLengths),
  };
}

export function formatCycleDate(date: Date): string {
  return format(date, "MMM d");
}

export function getCycleProgress(currentDay: number, cycleLength: number = 28): number {
  return Math.min(1, currentDay / cycleLength);
}

// Sleep score calculation (0-100)
export function calculateSleepScore(
  quality: number,     // 1-5
  freshness: number,   // 1-5
  durationHours: number,
  disturbanceCount: number
): number {
  const qualityScore = (quality / 5) * 35;
  const freshnessScore = (freshness / 5) * 25;

  // Optimal sleep is 7-9 hours
  let durationScore = 0;
  if (durationHours >= 7 && durationHours <= 9) {
    durationScore = 25;
  } else if (durationHours >= 6 && durationHours <= 10) {
    durationScore = 18;
  } else {
    durationScore = 8;
  }

  const disturbancePenalty = Math.min(15, disturbanceCount * 5);
  const disturbanceScore = 15 - disturbancePenalty;

  return Math.round(qualityScore + freshnessScore + durationScore + disturbanceScore);
}
