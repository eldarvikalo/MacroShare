"use client"

import * as React from "react"
import { toErrorMessage } from "@/lib/api/client"
import { createRecipe, searchIngredients } from "@/lib/api/services"
import type { IngredientSearchResult, MealType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NutriScoreBadge } from "@/components/widgets"
import { useToast } from "@/components/toast"
import { Search, Plus, X, Minus } from "lucide-react"

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"]

const POPULAR_INGREDIENTS = [
  "Chicken Breast (raw)",
  "Egg (whole)",
  "White Rice (cooked)",
  "Rolled Oats",
  "Salmon Fillet",
  "Lean Beef Mince (5% fat)",
  "Greek Yogurt (0% fat)",
  "Broccoli",
  "Sweet Potato",
  "Banana",
  "Almonds",
  "Olive Oil",
]

interface QueueItem {
  ingredient: IngredientSearchResult
  grams: number
}

function estimateGrade(totals: {
  protein: number
  sugar: number
  fat: number
  calories: number
}): string {
  if (totals.calories <= 0) return "?"
  const score = totals.protein - totals.sugar * 2 - totals.fat * 0.5
  if (score >= 40) return "A"
  if (score >= 20) return "B"
  if (score >= 0) return "C"
  if (score >= -20) return "D"
  return "E"
}

export function BuildRecipeSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const { toast } = useToast()
  const [name, setName] = React.useState("")
  const [mealType, setMealType] = React.useState<MealType>("Dinner")
  const [instructions, setInstructions] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<IngredientSearchResult[]>([])
  const [popular, setPopular] = React.useState<IngredientSearchResult[]>([])
  const [searching, setSearching] = React.useState(false)
  const [queue, setQueue] = React.useState<QueueItem[]>([])
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    let active = true
    Promise.all(POPULAR_INGREDIENTS.map((n) => searchIngredients(n, 1)))
      .then((lists) => {
        if (!active) return
        const seen = new Set<number>()
        const picks: IngredientSearchResult[] = []
        for (const list of lists) {
          const match = list[0]
          if (match && !seen.has(match.id)) {
            seen.add(match.id)
            picks.push(match)
          }
        }
        setPopular(picks)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const handle = setTimeout(async () => {
      setSearching(true)
      try {
        setResults(await searchIngredients(q, 25))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(handle)
  }, [query, open])

  const displayList = query.trim().length >= 2 ? results : popular

  function addIngredient(ing: IngredientSearchResult) {
    setQueue((q) =>
      q.find((x) => x.ingredient.id === ing.id) ? q : [...q, { ingredient: ing, grams: 100 }]
    )
  }

  function updateGrams(id: number, delta: number) {
    setQueue((q) =>
      q.map((x) =>
        x.ingredient.id === id ? { ...x, grams: Math.max(1, x.grams + delta) } : x
      )
    )
  }

  function setGrams(id: number, grams: number) {
    if (Number.isNaN(grams)) return
    setQueue((q) =>
      q.map((x) =>
        x.ingredient.id === id ? { ...x, grams: Math.max(1, Math.round(grams)) } : x
      )
    )
  }

  function removeItem(id: number) {
    setQueue((q) => q.filter((x) => x.ingredient.id !== id))
  }

  const totals = queue.reduce(
    (acc, x) => {
      const f = x.grams / 100
      acc.calories += x.ingredient.caloriesPer100g * f
      acc.protein += x.ingredient.proteinPer100g * f
      acc.carbs += x.ingredient.carbsPer100g * f
      acc.fat += x.ingredient.fatPer100g * f
      acc.sugar += x.ingredient.sugarPer100g * f
      acc.grams += x.grams
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, grams: 0 }
  )

  const grade = estimateGrade(totals)

  async function handleSave() {
    if (!name.trim() || queue.length === 0) return
    setSaving(true)
    setError(null)
    try {
      await createRecipe({
        name: name.trim(),
        mealType,
        instructions: instructions.trim() || null,
        items: queue.map((x) => ({
          ingredientId: x.ingredient.id,
          quantityGrams: x.grams,
        })),
      })
      toast("Recipe saved")
      setName("")
      setQueue([])
      setInstructions("")
      setQuery("")
      onSaved?.()
      onClose()
    } catch (e) {
      setError(toErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="glow-top pointer-events-none absolute inset-x-0 top-0 h-40" />
      <div className="relative mx-auto flex w-full max-w-lg items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-100">Build a recipe</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rname">Recipe name</Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My high-protein bowl"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Meal type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5">
          <Label>Add ingredients</Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ingredients…"
              className="pl-9"
            />
          </div>
          {searching && <p className="mt-2 text-xs text-slate-500">Searching…</p>}
          <div className="mt-2 flex flex-col gap-1.5">
            {displayList.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{ing.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {ing.caloriesPer100g} kcal · {ing.proteinPer100g}g P · {ing.carbsPer100g}g C ·{" "}
                    {ing.fatPer100g}g F /100g
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => addIngredient(ing)}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Label>Recipe queue</Label>
          {queue.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-slate-700 px-3 py-4 text-center text-sm text-slate-500">
              Add ingredients to build your recipe.
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-1.5">
              {queue.map((x) => (
                <div
                  key={x.ingredient.id}
                  className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2"
                >
                  <span className="flex-1 text-sm text-slate-200">{x.ingredient.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => updateGrams(x.ingredient.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-0.5">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={x.grams}
                        onChange={(e) => setGrams(x.ingredient.id, Number(e.target.value))}
                        className="h-7 w-16 px-2 text-center text-sm tabular-nums"
                        aria-label={`Grams for ${x.ingredient.name}`}
                      />
                      <span className="text-xs text-slate-500">g</span>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => updateGrams(x.ingredient.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeItem(x.ingredient.id)}
                      className="ml-1 text-slate-500 hover:text-red-400"
                      aria-label={`Remove ${x.ingredient.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <Label htmlFor="instr">Instructions</Label>
          <Textarea
            id="instr"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Cook everything together, then split…"
          />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg border-t border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NutriScoreBadge grade={grade} size="sm" />
            <span className="text-xs text-slate-400">Nutri-Score estimate</span>
          </div>
          <span className="text-xs text-slate-500">{Math.round(totals.grams)}g total</span>
        </div>
        <div className="mb-3 grid grid-cols-5 gap-1.5 text-center">
          {[
            { l: "kcal", v: Math.round(totals.calories) },
            { l: "P", v: `${Math.round(totals.protein)}g` },
            { l: "C", v: `${Math.round(totals.carbs)}g` },
            { l: "F", v: `${Math.round(totals.fat)}g` },
            { l: "Sugar", v: `${Math.round(totals.sugar)}g` },
          ].map((s) => (
            <div key={s.l} className="rounded-lg bg-slate-900 py-1.5">
              <p className="text-sm font-bold text-slate-100">{s.v}</p>
              <p className="text-[10px] text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
        <Button
          variant="indigo"
          className="w-full"
          disabled={!name.trim() || queue.length === 0 || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save recipe"}
        </Button>
      </div>
    </div>
  )
}
