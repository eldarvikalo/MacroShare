"use client"

import * as React from "react"
import { useAuth } from "@/auth/AuthContext"
import { useApp } from "@/components/app-context"
import { toErrorMessage } from "@/lib/api/client"
import {
  deleteRecipe,
  getDailyProgress,
  getHouseholdMembers,
  getRecipes,
  logMeal,
  splitMeal,
} from "@/lib/api/services"
import {
  memberColor,
  memberInitial,
  recipeTotalGrams,
} from "@/lib/helpers"
import type {
  DailyProgress,
  HouseholdMember,
  MealSplitResult,
  PersonPortion,
  Recipe,
} from "@/lib/types"
import { round } from "@/lib/utils"
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
import { Trash2, Soup, UtensilsCrossed, Plus } from "lucide-react"
import { BuildRecipeSheet } from "@/components/screens/build-recipe-sheet"

export function CookScreen() {
  const { householdId } = useAuth()
  const { selectedRecipeId, dataVersion, bumpData } = useApp()
  const { toast } = useToast()

  const [members, setMembers] = React.useState<HouseholdMember[]>([])
  const [recipes, setRecipes] = React.useState<Recipe[]>([])
  const [progress, setProgress] = React.useState<DailyProgress[]>([])
  const [recipeId, setRecipeId] = React.useState<number | null>(selectedRecipeId)
  const [participants, setParticipants] = React.useState<number[]>([])
  const [result, setResult] = React.useState<MealSplitResult | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [splitting, setSplitting] = React.useState(false)
  const [logging, setLogging] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [mealLogged, setMealLogged] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [buildOpen, setBuildOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const reload = React.useCallback(async () => {
    if (!householdId) return
    setLoading(true)
    try {
      const [m, r, p] = await Promise.all([
        getHouseholdMembers(householdId),
        getRecipes(),
        getDailyProgress(),
      ])
      setMembers(m)
      setRecipes(r)
      setProgress(p)
      setParticipants((prev) => (prev.length ? prev : m.map((x) => x.id)))
      setRecipeId((prev) => {
        if (prev && r.some((x) => x.id === prev)) return prev
        if (selectedRecipeId && r.some((x) => x.id === selectedRecipeId)) return selectedRecipeId
        return r[0]?.id ?? null
      })
      setError(null)
    } catch (e) {
      setError(toErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [householdId, selectedRecipeId])

  React.useEffect(() => {
    reload()
  }, [reload, dataVersion])

  React.useEffect(() => {
    if (selectedRecipeId) {
      setRecipeId(selectedRecipeId)
      setResult(null)
      setMealLogged(false)
    }
  }, [selectedRecipeId])

  const recipe = recipes.find((r) => r.id === recipeId) ?? null

  function toggleParticipant(id: number) {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleCook() {
    if (!recipeId || participants.length === 0) return
    setSplitting(true)
    setError(null)
    try {
      const data = await splitMeal({ recipeId, userIds: participants })
      setResult(data)
      setMealLogged(false)
    } catch (e) {
      setError(toErrorMessage(e))
      setResult(null)
    } finally {
      setSplitting(false)
    }
  }

  async function handleLog() {
    if (!result || !recipe) return
    setLogging(true)
    setError(null)
    try {
      await logMeal({
        recipeId: result.recipeId,
        mealType: recipe.mealType,
        portions: result.portions.map((p) => ({
          userId: p.userId,
          portionGrams: p.portionGrams,
          calories: p.calories,
          protein: p.protein,
          carbs: p.carbs,
          fat: p.fat,
          sugar: p.sugar,
        })),
      })
      setMealLogged(true)
      bumpData()
      toast("Meal logged — macros updated")
    } catch (e) {
      setError(toErrorMessage(e))
    } finally {
      setLogging(false)
    }
  }

  async function handleDelete() {
    if (!recipe) return
    setDeleting(true)
    setError(null)
    try {
      await deleteRecipe(recipe.id)
      const remaining = recipes.filter((r) => r.id !== recipe.id)
      setRecipes(remaining)
      setRecipeId(remaining[0]?.id ?? null)
      setResult(null)
      setConfirmDelete(false)
      toast("Recipe deleted")
    } catch (e) {
      setError(toErrorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading recipes…</div>
  }

  return (
    <div>
      <ScreenHeader subtitle="Cook for Us" members={members} />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Cook for Us</h1>
          <p className="text-sm text-slate-400">Cook one meal, split it perfectly.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setBuildOpen(true)}>
          <Plus className="h-4 w-4" /> Recipe
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Card className="p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Choose a recipe
        </label>
        {recipes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 px-4 py-3 text-sm text-slate-400">
            No recipes yet. Create one with the Recipe button.
          </p>
        ) : (
          <Select
            value={recipeId ? String(recipeId) : undefined}
            onValueChange={(v) => {
              setRecipeId(Number(v))
              setResult(null)
              setMealLogged(false)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a recipe" />
            </SelectTrigger>
            <SelectContent>
              {recipes.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name} · {r.mealType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {recipe && (
          <>
            <div className="mt-3 flex items-center gap-2">
              <NutriScoreBadge grade={recipe.nutriScoreGrade} size="sm" />
              <span className="text-sm text-slate-300">
                {round(recipe.totalCalories)} kcal · {round(recipe.totalProtein)}g protein total
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-950/50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Raw ingredients
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                {recipe.ingredients
                  .map((i) => `${round(i.quantityGrams)}g ${i.name}`)
                  .join(" · ")}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Total raw weight: {round(recipeTotalGrams(recipe))}g
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete recipe
            </button>
          </>
        )}
      </Card>

      <Card className="mt-4 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Who&apos;s eating?
        </p>
        <div className="flex flex-wrap gap-2">
          {members.map((m, idx) => {
            const selected = participants.includes(m.id)
            const color = memberColor(m, idx)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleParticipant(m.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 transition-all active:scale-95 ${
                  selected
                    ? "border-transparent bg-slate-800"
                    : "border-slate-700 bg-transparent opacity-50"
                }`}
                style={selected ? { boxShadow: `inset 0 0 0 1.5px ${color}66` } : undefined}
              >
                <Avatar initial={memberInitial(m)} color={color} size={28} ring={selected} />
                <span className="text-sm font-medium text-slate-200">{m.name}</span>
                <span className="text-xs text-slate-500">
                  {Math.round(m.targetCalories).toLocaleString()} kcal
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">{participants.length} people selected</p>
      </Card>

      <Button
        size="lg"
        className="mt-4 w-full"
        disabled={!recipe || participants.length === 0 || splitting}
        onClick={handleCook}
      >
        {splitting ? "Splitting…" : "Cook for Us"}
      </Button>

      {result && recipe && (
        <SplitResults
          result={result}
          recipe={recipe}
          members={members}
          progress={progress}
          logged={mealLogged}
          logging={logging}
          onLog={handleLog}
        />
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete recipe?</DialogTitle>
            <DialogDescription>
              This will remove &quot;{recipe?.name}&quot; from your saved recipes. This can&apos;t be
              undone.
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
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BuildRecipeSheet
        open={buildOpen}
        onClose={() => setBuildOpen(false)}
        onSaved={() => {
          setBuildOpen(false)
          bumpData()
          reload()
        }}
      />
    </div>
  )
}

function SplitResults({
  result,
  recipe,
  members,
  progress,
  logged,
  logging,
  onLog,
}: {
  result: MealSplitResult
  recipe: Recipe
  members: HouseholdMember[]
  progress: DailyProgress[]
  logged: boolean
  logging: boolean
  onLog: () => void
}) {
  return (
    <div className="mt-6 animate-slide-up">
      <Card className="p-5">
        <p className="font-bold text-slate-100">{result.recipeName} · plates</p>
        <p className="mt-1 text-sm text-slate-400">
          Whole meal: {round(result.totalMeal.totalGrams)}g · {round(result.totalMeal.calories)}{" "}
          kcal · {round(result.totalMeal.protein)}g protein
        </p>
        <Button
          className="mt-4 w-full"
          variant={logged ? "secondary" : "default"}
          disabled={logged || logging}
          onClick={onLog}
        >
          {logged ? "Logged today" : logging ? "Logging…" : "Log this meal"}
        </Button>
      </Card>

      <Card className="mt-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Soup className="h-4 w-4 text-emerald-400" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total raw ingredients · one shared pot
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {recipe.ingredients.map((ing) => (
            <div key={ing.ingredientId} className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{ing.name}</span>
              <span className="font-medium text-slate-400">{round(ing.quantityGrams)}g</span>
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

        <SplitBar portions={result.portions} members={members} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {result.portions.map((p) => (
            <PlateCard key={p.userId} portion={p} members={members} progress={progress} />
          ))}
        </div>
      </Card>
    </div>
  )
}

function SplitBar({
  portions,
  members,
}: {
  portions: PersonPortion[]
  members: HouseholdMember[]
}) {
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-800">
        {portions.map((p) => {
          const member = members.find((m) => m.id === p.userId)
          const color = member
            ? memberColor(member, members.indexOf(member))
            : p.avatarColor ?? "#2563eb"
          return (
            <div
              key={p.userId}
              className="h-full transition-all duration-700"
              style={{ width: `${p.ratioPercent}%`, backgroundColor: color }}
              title={`${p.name} ${p.ratioPercent}%`}
            />
          )
        })}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {portions.map((p) => (
          <span key={p.userId} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  members.find((m) => m.id === p.userId)?.avatarColor ??
                  p.avatarColor ??
                  "#2563eb",
              }}
            />
            {round(p.ratioPercent, 1)}% {p.name}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        Split based on remaining calories today — whoever has more room gets a bigger plate.
      </p>
    </div>
  )
}

function PlateCard({
  portion,
  members,
  progress,
}: {
  portion: PersonPortion
  members: HouseholdMember[]
  progress: DailyProgress[]
}) {
  const member = members.find((m) => m.id === portion.userId)
  const memberProgress = progress.find((d) => d.userId === portion.userId)
  const color = member
    ? memberColor(member, members.indexOf(member))
    : portion.avatarColor ?? "#2563eb"
  const targetCal = member?.targetCalories ?? memberProgress?.targetCalories ?? 2000
  const targetProt = member?.targetProtein ?? memberProgress?.targetProtein ?? 100
  const consumedCal = memberProgress?.consumedCalories ?? 0
  const consumedProt = memberProgress?.consumedProtein ?? 0
  const newCalories = consumedCal + portion.calories
  const newProtein = consumedProt + portion.protein
  const calPct = Math.round((newCalories / targetCal) * 100)
  const protPct = Math.round((newProtein / targetProt) * 100)

  return (
    <div
      className="rounded-2xl border border-slate-800 p-4"
      style={{ backgroundColor: `${color}14` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Avatar
          initial={member ? memberInitial(member) : portion.name[0]}
          color={color}
          size={32}
        />
        <span className="text-sm font-semibold text-slate-200">
          {round(portion.ratioPercent, 1)}% of the meal
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold" style={{ color }}>
          {round(portion.portionGrams)}g
        </span>
        <span className="text-xs text-slate-500">on the plate</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Calories", value: round(portion.calories) },
          { label: "Protein", value: `${round(portion.protein)}g` },
          { label: "Carbs", value: `${round(portion.carbs)}g` },
          { label: "Fat", value: `${round(portion.fat)}g` },
          { label: "Sugar", value: `${round(portion.sugar)}g` },
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
              {round(newCalories)} / {round(targetCal)} ({calPct}%)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, calPct)}%`, backgroundColor: color }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-slate-400">
            <span>Protein</span>
            <span>
              {round(newProtein)} / {round(targetProt)}g ({protPct}%)
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
          <UtensilsCrossed className="h-3 w-3" />+{round(portion.calories)} kcal toward daily goal
        </Badge>
      </div>
    </div>
  )
}
