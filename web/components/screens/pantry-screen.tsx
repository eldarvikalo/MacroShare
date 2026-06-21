"use client"

import * as React from "react"
import { useApp } from "@/components/app-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { NutriScoreBadge } from "@/components/widgets"
import { ScreenHeader } from "@/components/screen-header"
import { PANTRY } from "@/lib/pantry"
import { getSuggestions } from "@/lib/suggestions"
import type { MealType, IngredientCategory } from "@/lib/types"
import { Search, ArrowRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORY_STYLES: Record<IngredientCategory, string> = {
  Protein: "text-rose-300 bg-rose-500/10",
  Grain: "text-amber-300 bg-amber-500/10",
  Veg: "text-emerald-300 bg-emerald-500/10",
  Dairy: "text-sky-300 bg-sky-500/10",
  Fat: "text-orange-300 bg-orange-500/10",
  Fruit: "text-fuchsia-300 bg-fuchsia-500/10",
}

export function PantryScreen() {
  return (
    <div>
      <ScreenHeader subtitle="Pantry & Suggestions" />
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-slate-100">Pantry</h1>
      <Tabs defaultValue="pantry">
        <TabsList className="w-full">
          <TabsTrigger value="pantry" className="flex-1">
            Pantry
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex-1">
            Suggestions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pantry">
          <PantryList />
        </TabsContent>
        <TabsContent value="suggestions">
          <SuggestionsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PantryList() {
  const [query, setQuery] = React.useState("")
  const filtered = PANTRY.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">
        {PANTRY.length} items stocked · Last updated today
      </p>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pantry…"
          className="pl-9"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        {filtered.map((item) => {
          const low = item.grams < 200
          return (
            <Card key={item.name} className="rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {low && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
                  <span className="truncate text-sm font-medium text-slate-200">{item.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      CATEGORY_STYLES[item.category]
                    )}
                  >
                    {item.category}
                  </span>
                  <Badge variant={low ? "amber" : "slate"}>{item.grams.toLocaleString()}g</Badge>
                </div>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No matching pantry items.</p>
        )}
      </div>
    </div>
  )
}

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"]

function SuggestionsList() {
  const { goToCookWithRecipe } = useApp()
  const [mealType, setMealType] = React.useState<MealType>("Dinner")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [mealType])

  const suggestions = getSuggestions(mealType)

  return (
    <div>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {MEAL_TYPES.map((mt) => (
          <button
            key={mt}
            onClick={() => setMealType(mt)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95",
              mealType === mt
                ? "bg-primary text-primary-foreground"
                : "bg-slate-800 text-slate-300"
            )}
          >
            {mt}
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Recipes matching at least 80% of your pantry, ranked healthiest first by Nutri-Score.
      </p>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No {mealType.toLowerCase()} recipes match your pantry yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s.recipeId}
              onClick={() => goToCookWithRecipe(s.recipeId)}
              className="text-left"
            >
              <Card className="h-full rounded-3xl p-4 transition-colors hover:border-emerald-500/40 active:scale-[0.99]">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <NutriScoreBadge grade={s.nutriScoreGrade} />
                  {s.matchRatio === 100 ? (
                    <Badge variant="default">100% Match</Badge>
                  ) : s.missingIngredients.length === 1 ? (
                    <Badge variant="amber">Missing 1 item</Badge>
                  ) : (
                    <Badge variant="slate">{s.matchRatio}% Match</Badge>
                  )}
                </div>
                <p className="font-bold text-slate-100">{s.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {s.totalProtein}g protein · {s.totalSugar}g sugar · {s.totalCalories} kcal
                </p>
                {s.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {s.missingIngredients.length > 0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    Missing: {s.missingIngredients.join(", ")}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  Cook this <ArrowRight className="h-3 w-3" />
                </span>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
