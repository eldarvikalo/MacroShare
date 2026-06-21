"use client"

import { useApp } from "@/components/app-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, ProgressRing } from "@/components/widgets"
import { ScreenHeader } from "@/components/screen-header"
import { MEMBERS, DAILY_PROGRESS, HOUSEHOLD_NAME } from "@/lib/members"
import { TODAYS_MEALS, getSuggestions } from "@/lib/suggestions"
import { Sunrise, Sun, Moon, ChefHat, Plus, ArrowRight, CheckCircle2 } from "lucide-react"

export function DashboardScreen() {
  const { user, setActiveTab, goToCookWithRecipe } = useApp()
  const dinnerSuggestion = getSuggestions("Dinner")[0]

  return (
    <div>
      <ScreenHeader />

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
          Welcome back, {user?.name}
        </h1>
        <div className="mt-2 inline-flex">
          <Badge variant="default" className="gap-1.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {HOUSEHOLD_NAME} · On track
          </Badge>
        </div>
      </div>

      {/* Duo macro cards */}
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
        {DAILY_PROGRESS.map((p) => {
          const member = MEMBERS.find((m) => m.id === p.userId)!
          const calPct = Math.round((p.consumedCalories / p.targetCalories) * 100)
          const protPct = Math.round((p.consumedProtein / p.targetProtein) * 100)
          return (
            <Card
              key={p.userId}
              className="w-[88%] shrink-0 snap-center sm:w-[calc(50%-0.375rem)]"
            >
              <div className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar initial={member.initial} color={member.avatarColor} size={42} />
                  <div>
                    <p className="font-bold text-slate-100">{member.name}</p>
                    <p className="text-xs text-slate-400">
                      {member.targetCalories.toLocaleString()} kcal · {member.targetProtein}g protein
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ProgressRing
                    value={calPct}
                    color={member.avatarColor}
                    label={`${calPct}%`}
                    sublabel={`${p.consumedCalories.toLocaleString()}/${p.targetCalories.toLocaleString()} kcal`}
                  />
                  <ProgressRing
                    value={protPct}
                    color={member.avatarColor}
                    label={`${protPct}%`}
                    sublabel={`${p.consumedProtein}/${p.targetProtein}g protein`}
                  />
                  <ProgressRing
                    value={100}
                    color="#10b981"
                    label={`${p.consumedCarbs}g`}
                    sublabel="carbs logged"
                    trackColor="#1e293b"
                  />
                  <ProgressRing
                    value={100}
                    color="#f59e0b"
                    label={`${p.consumedFat}g`}
                    sublabel="fat logged"
                    trackColor="#1e293b"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="slate">{p.remainingCalories.toLocaleString()} kcal left</Badge>
                  <Badge variant="slate">{p.remainingProtein}g protein left</Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Today's meals timeline */}
      <h2 className="mb-3 mt-7 text-base font-bold text-slate-100">Today&apos;s meals</h2>
      <div className="flex flex-col gap-3">
        {/* Breakfast - logged */}
        {TODAYS_MEALS.map((meal) => (
          <Card key={meal.recipeName} className="overflow-hidden">
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sunrise className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {meal.mealType}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Logged {meal.time}
                </span>
              </div>
              <p className="mb-3 font-bold text-slate-100">{meal.recipeName}</p>
              <div className="flex flex-col gap-2">
                {meal.portions.map((portion) => {
                  const member = MEMBERS.find((m) => m.name === portion.name)!
                  const pct = Math.round(
                    (portion.calories / member.targetCalories) * 100
                  )
                  return (
                    <div key={portion.name} className="flex items-center gap-3">
                      <Avatar initial={member.initial} color={member.avatarColor} size={26} ring={false} />
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-slate-300">
                            {portion.name}: {portion.grams}g plate
                          </span>
                          <span className="text-slate-500">
                            {portion.calories} kcal · {portion.protein}g
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: member.avatarColor }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        ))}

        {/* Lunch - empty */}
        <button
          onClick={() => setActiveTab("cook")}
          className="flex items-center justify-between rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-left transition-colors hover:border-emerald-500/50 hover:bg-slate-900/70 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lunch</p>
              <p className="text-sm font-medium text-slate-300">Empty slot</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
            <ChefHat className="h-4 w-4" /> Cook this meal
          </span>
        </button>

        {/* Dinner - planned suggestion */}
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dinner · Planned
            </span>
          </div>
          {dinnerSuggestion && (
            <button
              onClick={() => goToCookWithRecipe(dinnerSuggestion.recipeId)}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-800/60 p-3 text-left transition-colors hover:bg-slate-800 active:scale-[0.99]"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">{dinnerSuggestion.name}</p>
                <p className="text-xs text-emerald-400">100% pantry match</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </Card>
      </div>

      {/* FAB */}
      <button
        onClick={() => setActiveTab("cook")}
        aria-label="Cook a new meal"
        className="fixed bottom-24 right-[max(1rem,calc(50%-16rem))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-emerald-500/30 transition-transform active:scale-90"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  )
}
