"use client"

import * as React from "react"
import type { NutriGrade } from "@/lib/types"
import { cn } from "@/lib/utils"

const NUTRI_COLORS: Record<NutriGrade, string> = {
  A: "#038141",
  B: "#85bb2f",
  C: "#fecb02",
  D: "#ee8100",
  E: "#e63e11",
}

export function NutriScoreBadge({ grade, size = "md" }: { grade: NutriGrade; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm"
  const dark = grade === "C"
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-extrabold",
        dim,
        dark ? "text-slate-900" : "text-white"
      )}
      style={{ backgroundColor: NUTRI_COLORS[grade] }}
      aria-label={`Nutri-Score ${grade}`}
    >
      {grade}
    </span>
  )
}

export function Avatar({
  initial,
  color,
  size = 40,
  ring = true,
}: {
  initial: string
  color: string
  size?: number
  ring?: boolean
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.42,
        boxShadow: ring ? `0 0 0 2px rgba(255,255,255,0.12), 0 0 0 4px ${color}33` : undefined,
      }}
    >
      {initial}
    </span>
  )
}

export function ProgressRing({
  value,
  size = 76,
  stroke = 7,
  color,
  label,
  sublabel,
  trackColor = "#1e293b",
}: {
  value: number
  size?: number
  stroke?: number
  color: string
  label: string
  sublabel: string
  trackColor?: string
}) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const [offset, setOffset] = React.useState(circ)

  React.useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (clamped / 100) * circ), 60)
    return () => clearTimeout(t)
  }, [clamped, circ])

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-100">{label}</span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-slate-400">{sublabel}</span>
    </div>
  )
}
