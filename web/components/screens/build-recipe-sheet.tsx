"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NutriScoreBadge } from "@/components/widgets"
import { useToast } from "@/components/toast"
import { INGREDIENT_DB, POPULAR_INGREDIENTS, type IngredientMacro } from "@/lib/ingredients"
import { estimateNutriScore } from "@/lib/split"
import { Search, Plus, X, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QueueItem extends IngredientMacro {
  grams: number
}

export function BuildRecipeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast()
  const [query, setQuery] = React.useState("")
  const [queue, setQueue] = React.useState<QueueItem[]>([])
  const [name, setName] = React.useState("")
  const [mealType, setMealType] = React.useState("Dinner")
  const [instructions, setInstructions] = React.useState("")

  const results = React.useMemo(() => {
    const base = query.trim()
      ? INGREDIENT_DB.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
      : INGREDIENT_DB.filter((i) => POPULAR_INGREDIENTS.includes(i.name))
    return base
  }, [query])

  function addIngredient(ing: IngredientMacro) {
    setQueue((q) =>
      q.find((x) => x.name === ing.name) ? q : [...q, { ...ing, grams: 100 }]
    )
  }

  function updateGrams(name: string, delta: number) {
    setQueue((q) =>
      q.map((x) => (x.name === name ? { ...x, grams: Math.max(10, x.grams + delta) } : x))
    )
  }

  function removeItem(name: string) {
    setQueue((q) => q.filter((x) => x.name !== name))
  }

  const totals = queue.reduce(
    (acc, x) => {
      const f = x.grams / 100
      acc.calories += x.calories * f
      acc.protein += x.protein * f
      acc.carbs += x.carbs * f
      acc.fat += x.fat * f
      acc.sugar += x.sugar * f
      acc.grams += x.grams
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, grams: 0 }
  )

  const grade =
    totals.grams > 0
      ? estimateNutriScore({
          protein: totals.protein,
          sugar: totals.sugar,
          fat: totals.fat,
          calories: totals.calories,
          grams: totals.grams,
        })
      : "C"

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
        {/* Recipe meta */}
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
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ingredient search */}
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
          <div className="mt-2 flex flex-col gap-1.5">
            {results.map((ing) => (
              <div
                key={ing.name}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{ing.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {ing.calories} kcal · {ing.protein}g P · {ing.carbs}g C · {ing.fat}g F /100g
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => addIngredient(ing)}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Queue */}
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
                  key={x.name}
                  className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2"
                >
                  <span className="flex-1 text-sm text-slate-200">{x.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => updateGrams(x.name, -25)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-14 text-center text-sm font-medium text-slate-300">
                      {x.grams}g
                    </span>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => updateGrams(x.name, 25)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <button
                      onClick={() => removeItem(x.name)}
                      className="ml-1 text-slate-500 hover:text-red-400"
                      aria-label={`Remove ${x.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
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

      {/* Live totals footer */}
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
          disabled={!name.trim() || queue.length === 0}
          onClick={() => {
            toast("Recipe saved")
            onClose()
            setName("")
            setQueue([])
            setInstructions("")
          }}
        >
          Save recipe
        </Button>
      </div>
    </div>
  )
}
