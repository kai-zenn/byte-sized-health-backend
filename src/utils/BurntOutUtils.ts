import { RiskLevel } from '@prisma/client';

export interface BurnoutCalculation {
  burnoutScore: number;
  riskLevel: RiskLevel;
}

export function calculateBurnoutScore(data: {
  sleepHours: number;
  workHours: number;
  stressLevel: number;
  activityMinutes: number;
}): BurnoutCalculation {
  let score = 0;

  // Sleep factor (0-30 points)
  if (data.sleepHours < 5) {
    score += 30;
  } else if (data.sleepHours < 6) {
    score += 20;
  } else if (data.sleepHours < 7) {
    score += 10;
  } else if (data.sleepHours > 9) {
    score += 5;
  }

  // Work hours factor (0-30 points)
  if (data.workHours > 12) {
    score += 30;
  } else if (data.workHours > 10) {
    score += 20;
  } else if (data.workHours > 8) {
    score += 10;
  }

  // Stress level factor (0-30 points)
  score += (data.stressLevel / 10) * 30;

  // Activity factor (0-10 points - inverse)
  const activityHours = data.activityMinutes / 60;
  if (activityHours < 0.5) {
    score += 10;
  } else if (activityHours < 1) {
    score += 5;
  }

  // Normalize to 0-100
  const burnoutScore = Math.min(100, Math.round(score));

  // Determine risk level
  let riskLevel: RiskLevel;
  if (burnoutScore < 30) {
    riskLevel = RiskLevel.LOW;
  } else if (burnoutScore < 60) {
    riskLevel = RiskLevel.MEDIUM;
  } else {
    riskLevel = RiskLevel.HIGH;
  }

  return { burnoutScore, riskLevel };
}
