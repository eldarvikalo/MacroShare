import type { HouseholdMember, DailyProgress, ScaleReading } from "./types"

export const HOUSEHOLD_NAME = "Eldar & Dina Home"

export const MEMBERS: HouseholdMember[] = [
  {
    id: 1,
    name: "Eldar",
    initial: "E",
    email: "eldar@macroshare.app",
    sex: "Male",
    age: 22,
    heightCm: 186,
    weightKg: 109.3,
    bmr: 2031,
    activityMultiplier: 1.725,
    tdee: 3503,
    targetCalories: 3400,
    targetProtein: 230,
    avatarColor: "#2563eb",
    profile: "High TDEE, high-protein cut",
  },
  {
    id: 2,
    name: "Dina",
    initial: "D",
    email: "dina@macroshare.app",
    sex: "Female",
    age: 23,
    heightCm: 168,
    weightKg: 62.3,
    bmr: 1297,
    activityMultiplier: 1.375,
    tdee: 1783,
    targetCalories: 1500,
    targetProtein: 115,
    avatarColor: "#db2777",
    profile: "Balanced macros, smaller portions",
  },
]

// Mock consumed-today values per the design spec
export const DAILY_PROGRESS: DailyProgress[] = [
  {
    userId: 1,
    name: "Eldar",
    targetCalories: 3400,
    targetProtein: 230,
    consumedCalories: 1840,
    consumedProtein: 142,
    consumedCarbs: 186,
    consumedFat: 52,
    remainingCalories: 1560,
    remainingProtein: 88,
  },
  {
    userId: 2,
    name: "Dina",
    targetCalories: 1500,
    targetProtein: 115,
    consumedCalories: 920,
    consumedProtein: 68,
    consumedCarbs: 94,
    consumedFat: 28,
    remainingCalories: 580,
    remainingProtein: 47,
  },
]

export const SCALE_READINGS: Record<number, ScaleReading[]> = {
  1: [
    { date: "Jun 21, 2026", weightKg: 108.7, bodyFatPercent: 24.2, changeKg: -0.6 },
    { date: "Jun 14, 2026", weightKg: 109.3, bodyFatPercent: 24.6, changeKg: -0.8 },
    { date: "Jun 7, 2026", weightKg: 110.1, bodyFatPercent: 25.1, changeKg: -0.5 },
    { date: "May 31, 2026", weightKg: 110.6, bodyFatPercent: 25.4, changeKg: -0.7 },
    { date: "May 24, 2026", weightKg: 111.3, bodyFatPercent: 25.9, changeKg: 0 },
  ],
  2: [
    { date: "Jun 21, 2026", weightKg: 61.8, bodyFatPercent: 22.1, changeKg: -0.5 },
    { date: "Jun 14, 2026", weightKg: 62.3, bodyFatPercent: 22.4, changeKg: -0.4 },
    { date: "Jun 7, 2026", weightKg: 62.7, bodyFatPercent: 22.8, changeKg: -0.3 },
    { date: "May 31, 2026", weightKg: 63.0, bodyFatPercent: 23.0, changeKg: -0.6 },
  ],
}
