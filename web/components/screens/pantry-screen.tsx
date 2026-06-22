"use client"

import * as React from "react"
import { useAuth } from "@/auth/AuthContext"
import { useApp } from "@/components/app-context"
import { toErrorMessage } from "@/lib/api/client"
import {
  addPantryItem,
  getMealSuggestions,
  getPantryItems,
  removePantryItem,
  searchIngredients,
  updatePantryItem,
} from "@/lib/api/services"
import { deriveIngredientCategory, suggestionTags } from "@/lib/helpers"
import type { IngredientSearchResult, MealSuggestion, MealType, PantryItem } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { NutriScoreBadge } from "@/components/widgets"
import { ScreenHeader } from "@/components/screen-header"
import { useToast } from "@/components/toast"
import {
  Search,
  ArrowRight,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORY_STYLES: Record<
  ReturnType<typeof deriveIngredientCategory>,
  string
> = {
  Protein: "text-rose-300 bg-rose-500/10",
  Grain: "text-amber-300 bg-amber-500/10",
  Veg: "text-emerald-300 bg-emerald-500/10",
  Dairy: "text-sky-300 bg-sky-500/10",
  Fat: "text-orange-300 bg-orange-500/10",
  Fruit: "text-fuchsia-300 bg-fuchsia-500/10",
}

export function PantryScreen() {
  const { householdId } = useAuth()
  const { bumpData } = useApp()
  const [pantry, setPantry] = React.useState<PantryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const reload = React.useCallback(async () => {
    if (!householdId) return
    setLoading(true)
    try {
      setPantry(await getPantryItems(householdId))
      setError(null)
    } catch (e) {
      setError(toErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [householdId])

  React.useEffect(() => {
    reload()
  }, [reload])

  function onPantryChanged() {
    bumpData()
    reload()
  }

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
          {error && (
            <p className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
          <PantryList
            items={pantry}
            loading={loading}
            householdId={householdId!}
            onChanged={onPantryChanged}
          />
        </TabsContent>
        <TabsContent value="suggestions">
          <SuggestionsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PantryList({
  items,
  loading,
  householdId,
  onChanged,
}: {
  items: PantryItem[]
  loading: boolean
  householdId: number
  onChanged: () => void
}) {
  const { toast } = useToast()
  const [query, setQuery] = React.useState("")
  const [addOpen, setAddOpen] = React.useState(false)
  const [savingId, setSavingId] = React.useState<number | null>(null)

  const filtered = items.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  const stockedIds = new Set(items.map((i) => i.ingredientId))

  async function changeQuantity(item: PantryItem, grams: number) {
    const next = Math.max(1, Math.round(grams))
    if (next === Math.round(item.quantityGrams)) return
    setSavingId(item.ingredientId)
    try {
      await updatePantryItem(householdId, item.ingredientId, next)
      onChanged()
    } catch (e) {
      toast(toErrorMessage(e))
    } finally {
      setSavingId(null)
    }
  }

  async function removeItem(item: PantryItem) {
    if (!window.confirm(`Remove "${item.name}" from your pantry?`)) return
    setSavingId(item.ingredientId)
    try {
      await removePantryItem(householdId, item.ingredientId)
      toast(`Removed ${item.name}`)
      onChanged()
    } catch (e) {
      toast(toErrorMessage(e))
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading pantry…</p>
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{items.length} items stocked</p>
        <Button size="sm" variant="secondary" onClick={() => setAddOpen((v) => !v)}>
          {addOpen ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add item
            </>
          )}
        </Button>
      </div>

      {addOpen && (
        <AddPantryPanel
          householdId={householdId}
          stockedIds={stockedIds}
          onAdded={() => {
            setAddOpen(false)
            onChanged()
          }}
        />
      )}

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
        {filtered.map((item) => (
          <PantryItemRow
            key={item.id}
            item={item}
            busy={savingId === item.ingredientId}
            onChangeQuantity={changeQuantity}
            onRemove={removeItem}
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            {items.length === 0 ? "Your pantry is empty. Add your first item." : "No matching pantry items."}
          </p>
        )}
      </div>
    </div>
  )
}

function PantryItemRow({
  item,
  busy,
  onChangeQuantity,
  onRemove,
}: {
  item: PantryItem
  busy: boolean
  onChangeQuantity: (item: PantryItem, grams: number) => void
  onRemove: (item: PantryItem) => void
}) {
  const [grams, setGrams] = React.useState(String(Math.round(item.quantityGrams)))

  React.useEffect(() => {
    setGrams(String(Math.round(item.quantityGrams)))
  }, [item.quantityGrams])

  const gramsNum = Math.round(item.quantityGrams)
  const low = gramsNum < 200
  const category = deriveIngredientCategory(item.name)

  function commitInput() {
    const n = Number(grams)
    if (!Number.isNaN(n)) onChangeQuantity(item, n)
    else setGrams(String(gramsNum))
  }

  return (
    <Card className="rounded-2xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {low && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
            <span className="truncate text-sm font-medium text-slate-200">{item.name}</span>
          </div>
          <span
            className={cn(
              "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
              CATEGORY_STYLES[category]
            )}
          >
            {category}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            disabled={busy}
            onClick={() => onChangeQuantity(item, gramsNum - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            min={1}
            step={1}
            value={grams}
            disabled={busy}
            onChange={(e) => setGrams(e.target.value)}
            onBlur={commitInput}
            onKeyDown={(e) => e.key === "Enter" && commitInput()}
            className="h-7 w-16 px-2 text-center text-sm tabular-nums"
            aria-label={`Grams for ${item.name}`}
          />
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            disabled={busy}
            onClick={() => onChangeQuantity(item, gramsNum + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(item)}
            className="ml-1 rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {low && <p className="mt-2 text-[11px] text-amber-400">Low stock</p>}
    </Card>
  )
}

function AddPantryPanel({
  householdId,
  stockedIds,
  onAdded,
}: {
  householdId: number
  stockedIds: Set<number>
  onAdded: () => void
}) {
  const { toast } = useToast()
  const [term, setTerm] = React.useState("")
  const [results, setResults] = React.useState<IngredientSearchResult[]>([])
  const [searching, setSearching] = React.useState(false)
  const [selected, setSelected] = React.useState<IngredientSearchResult | null>(null)
  const [grams, setGrams] = React.useState("100")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    const q = term.trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const handle = setTimeout(async () => {
      setSearching(true)
      try {
        setResults(await searchIngredients(q, 15))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(handle)
  }, [term])

  async function handleAdd() {
    if (!selected) return
    const quantity = Number(grams)
    if (Number.isNaN(quantity) || quantity <= 0) return
    setSaving(true)
    try {
      await addPantryItem(householdId, selected.id, quantity)
      toast(
        stockedIds.has(selected.id)
          ? `Added ${quantity}g to ${selected.name}`
          : `Stocked ${selected.name}`
      )
      setSelected(null)
      setTerm("")
      setGrams("100")
      onAdded()
    } catch (e) {
      toast(toErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-4 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-200">Add to pantry</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            setSelected(null)
          }}
          placeholder="Search ingredients to stock…"
          className="pl-9"
        />
      </div>
      {searching && <p className="mt-2 text-xs text-slate-500">Searching…</p>}
      {results.length > 0 && !selected && (
        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
          {results.map((ing) => (
            <button
              key={ing.id}
              type="button"
              onClick={() => setSelected(ing)}
              className="flex w-full items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2 text-left hover:bg-slate-800"
            >
              <span className="text-sm text-slate-200">{ing.name}</span>
              {stockedIds.has(ing.id) && (
                <Badge variant="slate" className="text-[10px]">
                  In pantry
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <p className="text-sm font-medium text-slate-100">{selected.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {stockedIds.has(selected.id)
              ? "Already in pantry — this will add to current stock."
              : "New pantry item"}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <LabelledGramsInput value={grams} onChange={setGrams} />
            <Button size="sm" disabled={saving} onClick={handleAdd}>
              {saving ? "Adding…" : "Add"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
              Back
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function LabelledGramsInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        min={1}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-20 text-center text-sm"
      />
      <span className="text-xs text-slate-500">g</span>
    </div>
  )
}

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"]

function SuggestionsList() {
  const { householdId } = useAuth()
  const { goToCookWithRecipe } = useApp()
  const [mealType, setMealType] = React.useState<MealType>("Dinner")
  const [suggestions, setSuggestions] = React.useState<MealSuggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loaded, setLoaded] = React.useState(false)

  async function load(next: MealType) {
    if (!householdId) return
    setMealType(next)
    setLoading(true)
    setError(null)
    try {
      setSuggestions(await getMealSuggestions(householdId, next))
      setLoaded(true)
    } catch (e) {
      setError(toErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load("Dinner")
  }, [householdId])

  return (
    <div>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {MEAL_TYPES.map((mt) => (
          <button
            key={mt}
            type="button"
            onClick={() => load(mt)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95",
              mealType === mt && loaded
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

      {error && (
        <p className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
      ) : loaded && suggestions.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No {mealType.toLowerCase()} recipes match your pantry yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {suggestions.map((s) => {
            const tags = suggestionTags(s)
            const matchRounded = Math.round(s.matchRatio)
            return (
              <button
                key={s.recipeId}
                type="button"
                onClick={() => goToCookWithRecipe(s.recipeId)}
                className="text-left"
              >
                <Card className="h-full rounded-3xl p-4 transition-colors hover:border-emerald-500/40 active:scale-[0.99]">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <NutriScoreBadge grade={s.nutriScoreGrade} />
                    {matchRounded >= 100 ? (
                      <Badge variant="default">100% Match</Badge>
                    ) : s.missingIngredients.length === 1 ? (
                      <Badge variant="amber">Missing 1 item</Badge>
                    ) : (
                      <Badge variant="slate">{matchRounded}% Match</Badge>
                    )}
                  </div>
                  <p className="font-bold text-slate-100">{s.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {Math.round(s.totalProtein)}g protein · {Math.round(s.totalSugar)}g sugar ·{" "}
                    {Math.round(s.totalCalories)} kcal
                  </p>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((t) => (
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
            )
          })}
        </div>
      )}
    </div>
  )
}
