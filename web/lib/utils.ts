import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function fallbackColor(seed: number): string {
  const palette = ["#2563eb", "#db2777", "#16a34a", "#d97706", "#7c3aed", "#0891b2"]
  return palette[seed % palette.length]
}

export function grams(value: number): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} g`
}

export function round(value: number, digits = 0): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: digits })
}

export function num(val: string): number | null {
  if (!val.trim()) return null
  const n = Number(val)
  return Number.isNaN(n) ? null : n
}
