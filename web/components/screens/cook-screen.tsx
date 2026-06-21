"use client"

import * as React from "react"
import { useApp } from "@/components/app-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Avatar, NutriScoreBadge } from "@/components/widgets"
import { ScreenHeader } from "@/components/screen-header"
import { useToast } from "@/components/toast"
import { MEMBERS, DAILY_PROGRESS } from "@/lib/members"
import { RECIPES, getRecipeById } from "@/lib/recipes"
import { splitMeal } from "@/lib/split"
import type { MealSplitResult, PersonPortion } from "@/lib/types"
import { Trash2, Soup, UtensilsCrossed, Plus } from "lucide-react"
import { BuildRecipeSheet } from "@/components/screens/build-recipe-sheet"

export function CookScreen() {
  const { selectedRecipeId, loggedMealIds, logMeal } = useApp()
  const { toast } = useToast()
  const [recipeId, setRecipeId] = React.useState(selectedRecipeId)
  const [participants, setParticipants] = React.useState<number[]>(MEMBERS.map((m) => m.id))
  const [result, setResult] = React.useState<MealSplitResult | null>(null)
  const [splitting, setSplitting] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [buildOpen, setBuildOpen] = React.useState(false)

  React.useEffect(() => {
    setRecipeId(selectedRecipeId)
    setResult(null)
  }, [selectedRecipeId])

  const recipe = getRecipeById(recipeId)!
  const logged = loggedMealIds.includes(recipeId)

  function toggleParticipant(id: number) {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function handleCook() {
    if (!recipe || participants.length === 0) return
    setSplitting(true)
    setResult(null)
    setTimeout(() => {
      setResult(splitMeal(recipe, participants, DAILY_PROGRESS))
      setSplitting(false)
    }, 650)
  }

  return (
    <div>
      <ScreenHeader subtitle="Cook for Us" />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Cook for Us</h1>
          <p className="text-sm text-slate-400">Cook one meal, split it perfectly.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setBuildOpen(true)}>
          <Plus className="h-4 w-4" /> Recipe
        </Button>
      </div>

      {/* Section A: Recipe selection */}
      <Card className="p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Choose a recipe
        </label>
        <Select
          value={String(recipeId)}
          onValueChange={(v) => {
            setRecipeId(Number(v))
            setResult(null)
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECIPES.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.name} · {r.mealType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-3 flex items-center gap-2">
          <NutriScoreBadge grade={recipe.nutriScoreGrade} size="sm" />
          <span className="text-sm text-slate-300">
            {recipe.calories.toLocaleString()} kcal · {recipe.protein}g protein total
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-950/50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Raw ingredients
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            {recipe.ingredients.map((i) => `${i.grams}g ${i.name}`).join(" · ")}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Total raw weight: {recipe.totalGrams.toLocaleString()}g
          </p>
        </div>

        <button
          onClick={() => setConfirmDelete(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete recipe
        </button>
      </Card>

      {/* Section B: Who's eating */}
      <Card className="mt-4 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Who&apos;s eating?
        </p>
        <div className="flex flex-wrap gap-2">
          {MEMBERS.map((m) => {
            const selected = participants.includes(m.id)
            return (
              <button
                key={m.id}
                onClick={() => toggleParticipant(m.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all active:scale-95 ${
                  selected
                    ? "border-transparent bg-slate-800"
                    : "border-slate-700 bg-transparent opacity-50"
                }`}
                style={selected ? { boxShadow: `inset 0 0 0 1.5px ${m.avatarColor}66` } : undefined}
              >
                <Avatar initial={m.initial} color={m.avatarColor} size={28} ring={selected} />
                <span className="text-sm font-medium text-slate-200">{m.name}</span>
                <span className="text-xs text-slate-500">
                  {m.targetCalories.toLocaleString()} kcal
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">{participants.length} people selected</p>
      </Card>

      {/* Section C: CTA */}
      <Button
        size="lg"
        className="mt-4 w-full"
        disabled={!recipe || participants.length === 0 || splitting}
        onClick={handleCook}
      >
        {splitting ? "Splitting…" : "Cook for Us"}
      </Button>

      {/* Section D: Results */}
      {result && (
        <SplitResults
          result={result}
          recipe={recipe}
          logged={logged}
          onLog={() => {
            logMeal(recipe.id)
            toast("Meal logged — macros updated")
          }}
        />
      )}

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete recipe?</DialogTitle>
            <DialogDescription>
              This will remove &quot;{recipe.name}&quot; from your saved recipes. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setConfirmDelete(false)
                toast("Recipe deleted")
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BuildRecipeSheet open={buildOpen} onClose={() => setBuildOpen(false)} />
    </div>
  )
}

function SplitResults({
  result,
  recipe,
  logged,
  onLog,
}: {
  result: MealSplitResult
  recipe: { name: string; ingredients: { name: string; grams: number }[] }
  logged: boolean
  onLog: () => void
}) {
  return (
    <div className="mt-6 animate-slide-up">
      {/* Whole meal summary */}
      <Card className="p-5">
        <p className="font-bold text-slate-100">{result.recipeName} · plates</p>
        <p className="mt-1 text-sm text-slate-400">
          Whole meal: {result.totalMeal.totalGrams.toLocaleString()}g ·{" "}
          {result.totalMeal.calories.toLocaleString()} kcal · {result.totalMeal.protein}g protein
        </p>
        <Button
          className="mt-4 w-full"
          variant={logged ? "secondary" : "default"}
          disabled={logged}
          onClick={onLog}
        >
          {logged ? "Logged today" : "Log this meal"}
        </Button>
      </Card>

      {/* Raw ingredients panel */}
      <Card className="mt-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Soup className="h-4 w-4 text-emerald-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total raw ingredients · one shared pot
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {recipe.ingredients.map((ing) => (
            <div key={ing.name} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{ing.name}</span>
              <span className="font-medium text-slate-400">{ing.grams}g</span>
            </div>
          ))}
        </div>

        <div className="my-4 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Smart split by remaining calories
          </span>
          <Separator className="flex-1" />
        </div>

        {/* Split diagram */}
        <SplitBar portions={result.portions} />

        {/* Plates */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {result.portions.map((p) => (
            <PlateCard key={p.userId} portion={p} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function SplitBar({ portions }: { portions: PersonPortion[] }) {
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-800">
        {portions.map((p) => (
          <div
            key={p.userId}
            className="h-full transition-all duration-700"
            style={{ width: `${p.ratioPercent}%`, backgroundColor: p.avatarColor }}
            title={`${p.name} ${p.ratioPercent}%`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {portions.map((p) => (
          <span key={p.userId} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.avatarColor }} />
            {p.ratioPercent}% {p.name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        Split based on remaining calories today — whoever has more room gets a bigger plate.
      </p>
    </div>
  )
}

function PlateCard({ portion }: { portion: PersonPortion }) {
  const member = MEMBERS.find((m) => m.id === portion.userId)!
  const progress = DAILY_PROGRESS.find((d) => d.userId === portion.userId)!
  const newCalories = progress.consumedCalories + portion.calories
  const newProtein = progress.consumedProtein + portion.protein
  const calPct = Math.round((newCalories / member.targetCalories) * 100)
  const protPct = Math.round((newProtein / member.targetProtein) * 100)

  return (
    <div
      className="rounded-2xl border border-slate-800 p-4"
      style={{ backgroundColor: `${member.avatarColor}14` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Avatar initial={member.initial} color={member.avatarColor} size={32} />
        <span className="text-sm font-semibold text-slate-200">
          {portion.ratioPercent}% of the meal
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold" style={{ color: member.avatarColor }}>
          {portion.portionGrams}g
        </span>
        <span className="text-xs text-slate-500">on the plate</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Calories", value: `${portion.calories}` },
          { label: "Protein", value: `${portion.protein}g` },
          { label: "Carbs", value: `${portion.carbs}g` },
          { label: "Fat", value: `${portion.fat}g` },
          { label: "Sugar", value: `${portion.sugar}g` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-slate-950/40 px-2 py-2">
            <p className="text-sm font-bold text-slate-100">{stat.value}</p>
            <p className="text-[10px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-slate-400">
            <span>Calories</span>
            <span>
              {newCalories.toLocaleString()} / {member.targetCalories.toLocaleString()} ({calPct}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, calPct)}%`, backgroundColor: member.avatarColor }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-slate-400">
            <span>Protein</span>
            <span>
              {newProtein} / {member.targetProtein}g ({protPct}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(100, protPct)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Badge variant="default" className="gap-1">
          <UtensilsCrossed className="h-3 w-3" />+{portion.calories} kcal toward daily goal
        </Badge>
      </div>
    </div>
  )
}
