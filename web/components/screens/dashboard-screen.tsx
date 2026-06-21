"use client"

import * as React from "react"
import { useAuth } from "@/auth/AuthContext"
import { useApp } from "@/components/app-context"
import { toErrorMessage } from "@/lib/api/client"
import {
  getDailyProgress,
  getHouseholdMembers,
  getMealSuggestions,
  getTodaysMeals,
} from "@/lib/api/services"
import {
  formatMealTime,
  householdLabel,
  memberColor,
  memberInitial,
  progressStatus,
} from "@/lib/helpers"
import type { DailyProgress, HouseholdMember, MealType, TodaysMeal } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, ProgressRing } from "@/components/widgets"
import { ScreenHeader } from "@/components/screen-header"
import {
  Sunrise,
  Sun,
  Moon,
  ChefHat,
  Plus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

const MEAL_ORDER: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"]
const MEAL_ICONS = {
  Breakfast: Sunrise,
  Lunch: Sun,
  Dinner: Moon,
  Snack: ChefHat,
} as const

export function DashboardScreen() {
  const { user, householdId } = useAuth()
  const { dataVersion, setActiveTab, goToCookWithRecipe } = useApp()
  const [members, setMembers] = React.useState<HouseholdMember[]>([])
  const [progress, setProgress] = React.useState<DailyProgress[]>([])
  const [meals, setMeals] = React.useState<TodaysMeal[]>([])
  const [dinnerSuggestion, setDinnerSuggestion] = React.useState<{
    recipeId: number
    name: string
    matchRatio: number
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!householdId) return
    let active = true
    setLoading(true)
    Promise.all([
      getHouseholdMembers(householdId),
      getDailyProgress(),
      getTodaysMeals(householdId),
      getMealSuggestions(householdId, "Dinner"),
    ])
      .then(([m, p, t, suggestions]) => {
        if (!active) return
        setMembers(m)
        setProgress(p)
        setMeals(t)
        const top = suggestions[0]
        setDinnerSuggestion(
          top ? { recipeId: top.recipeId, name: top.name, matchRatio: top.matchRatio } : null
        )
        setError(null)
      })
      .catch((e) => active && setError(toErrorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [householdId, dataVersion])

  const householdName = householdLabel(members)
  const status =
    progress.length > 0
      ? progress.every((p) => progressStatus(p) === "On track")
        ? "On track"
        : "In progress"
      : "On track"

  const loggedTypes = new Set(meals.map((m) => m.mealType))
  const emptySlots = MEAL_ORDER.filter((t) => !loggedTypes.has(t))

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">Loading dashboard…</div>
    )
  }

  return (
    <div>
      <ScreenHeader members={members} />

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
          Welcome back, {user?.name}
        </h1>
        <div className="mt-2 inline-flex">
          <Badge variant="default" className="gap-1.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {householdName} · {status}
          </Badge>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
        {progress.map((p, idx) => {
          const member = members.find((m) => m.id === p.userId)
          const color = member ? memberColor(member, idx) : "#2563eb"
          const calPct = p.targetCalories
            ? Math.round((p.consumedCalories / p.targetCalories) * 100)
            : 0
          const protPct = p.targetProtein
            ? Math.round((p.consumedProtein / p.targetProtein) * 100)
            : 0
          return (
            <Card
              key={p.userId}
              className="w-[88%] shrink-0 snap-center sm:w-[calc(50%-0.375rem)]"
            >
              <div className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar
                    initial={member ? memberInitial(member) : p.name[0]}
                    color={color}
                    size={42}
                  />
                  <div>
                    <p className="font-bold text-slate-100">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.targetCalories.toLocaleString()} kcal · {p.targetProtein}g protein
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ProgressRing
                    value={calPct}
                    color={color}
                    label={`${calPct}%`}
                    sublabel={`${Math.round(p.consumedCalories).toLocaleString()}/${p.targetCalories.toLocaleString()} kcal`}
                  />
                  <ProgressRing
                    value={protPct}
                    color={color}
                    label={`${protPct}%`}
                    sublabel={`${Math.round(p.consumedProtein)}/${p.targetProtein}g protein`}
                  />
                  <ProgressRing
                    value={100}
                    color="#10b981"
                    label={`${Math.round(p.consumedCarbs)}g`}
                    sublabel="carbs logged"
                    trackColor="#1e293b"
                  />
                  <ProgressRing
                    value={100}
                    color="#f59e0b"
                    label={`${Math.round(p.consumedFat)}g`}
                    sublabel="fat logged"
                    trackColor="#1e293b"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="slate">
                    {Math.round(p.remainingCalories).toLocaleString()} kcal left
                  </Badge>
                  <Badge variant="slate">{Math.round(p.remainingProtein)}g protein left</Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <h2 className="mb-3 mt-7 text-base font-bold text-slate-100">Today&apos;s meals</h2>
      <div className="flex flex-col gap-3">
        {meals.map((meal) => {
          const Icon = MEAL_ICONS[meal.mealType] ?? ChefHat
          return (
            <Card key={meal.mealLogId} className="overflow-hidden">
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {meal.mealType}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Logged {formatMealTime(meal.loggedAt)}
                  </span>
                </div>
                <p className="mb-3 font-bold text-slate-100">{meal.recipeName}</p>
                <div className="flex flex-col gap-2">
                  {meal.portions.map((portion) => {
                    const member = members.find((m) => m.id === portion.userId)
                    const targetCal = member?.targetCalories ?? 2000
                    const pct = Math.round((portion.calories / targetCal) * 100)
                    const color = member
                      ? memberColor(member, members.indexOf(member))
                      : portion.avatarColor ?? "#2563eb"
                    return (
                      <div key={portion.userId} className="flex items-center gap-3">
                        <Avatar
                          initial={member ? memberInitial(member) : portion.name[0]}
                          color={color}
                          size={26}
                          ring={false}
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-slate-300">
                              {portion.name}: {Math.round(portion.portionGrams)}g plate
                            </span>
                            <span className="text-slate-500">
                              {Math.round(portion.calories)} kcal · {Math.round(portion.protein)}g
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )
        })}

        {emptySlots.slice(0, 1).map((slot) => {
          const Icon = MEAL_ICONS[slot] ?? ChefHat
          return (
            <button
              key={slot}
              type="button"
              onClick={() => setActiveTab("cook")}
              className="flex items-center justify-between rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-left transition-colors hover:border-emerald-500/50 hover:bg-slate-900/70 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {slot}
                  </p>
                  <p className="text-sm font-medium text-slate-300">Empty slot</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
                <ChefHat className="h-4 w-4" /> Cook this meal
              </span>
            </button>
          )
        })}

        {dinnerSuggestion && !loggedTypes.has("Dinner") && (
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Dinner · Planned
              </span>
            </div>
            <button
              type="button"
              onClick={() => goToCookWithRecipe(dinnerSuggestion.recipeId)}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-800/60 p-3 text-left transition-colors hover:bg-slate-800 active:scale-[0.99]"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">{dinnerSuggestion.name}</p>
                <p className="text-xs text-emerald-400">
                  {Math.round(dinnerSuggestion.matchRatio)}% pantry match
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </Card>
        )}
      </div>

      <button
        type="button"
        onClick={() => setActiveTab("cook")}
        aria-label="Cook a new meal"
        className="fixed bottom-24 right-[max(1rem,calc(50%-16rem))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-emerald-500/30 transition-transform active:scale-90"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  )
}
