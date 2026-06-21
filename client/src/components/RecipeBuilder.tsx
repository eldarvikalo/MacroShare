import { useEffect, useMemo, useState } from "react";
import { toErrorMessage } from "../api/client";
import { createRecipe, searchIngredients } from "../api/services";
import type { IngredientSearchFilters, IngredientSearchResult, MealType } from "../types";
import { round } from "../utils";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

type FilterField = keyof IngredientSearchFilters;

const FILTER_ROWS: { min: FilterField; max: FilterField; label: string; unit: string }[] = [
  { min: "minCalories", max: "maxCalories", label: "Calories", unit: "kcal" },
  { min: "minProtein", max: "maxProtein", label: "Protein", unit: "g" },
  { min: "minCarbs", max: "maxCarbs", label: "Carbs", unit: "g" },
  { min: "minFat", max: "maxFat", label: "Fat", unit: "g" },
  { min: "minSugar", max: "maxSugar", label: "Sugar", unit: "g" }
];

const EMPTY_FILTER_INPUTS: Record<FilterField, string> = {
  minCalories: "",
  maxCalories: "",
  minProtein: "",
  maxProtein: "",
  minCarbs: "",
  maxCarbs: "",
  minFat: "",
  maxFat: "",
  minSugar: "",
  maxSugar: ""
};

function parseFilters(raw: Record<FilterField, string>): IngredientSearchFilters {
  const out: IngredientSearchFilters = {};
  for (const key of Object.keys(raw) as FilterField[]) {
    const val = raw[key].trim();
    if (!val) continue;
    const n = Number(val);
    if (!Number.isNaN(n)) out[key] = n;
  }
  return out;
}

function hasActiveFilters(filters: IngredientSearchFilters): boolean {
  return Object.keys(filters).length > 0;
}

function matchesFilters(ingredient: IngredientSearchResult, filters: IngredientSearchFilters): boolean {
  if (filters.minCalories !== undefined && ingredient.caloriesPer100g < filters.minCalories) return false;
  if (filters.maxCalories !== undefined && ingredient.caloriesPer100g > filters.maxCalories) return false;
  if (filters.minProtein !== undefined && ingredient.proteinPer100g < filters.minProtein) return false;
  if (filters.maxProtein !== undefined && ingredient.proteinPer100g > filters.maxProtein) return false;
  if (filters.minCarbs !== undefined && ingredient.carbsPer100g < filters.minCarbs) return false;
  if (filters.maxCarbs !== undefined && ingredient.carbsPer100g > filters.maxCarbs) return false;
  if (filters.minFat !== undefined && ingredient.fatPer100g < filters.minFat) return false;
  if (filters.maxFat !== undefined && ingredient.fatPer100g > filters.maxFat) return false;
  if (filters.minSugar !== undefined && ingredient.sugarPer100g < filters.minSugar) return false;
  if (filters.maxSugar !== undefined && ingredient.sugarPer100g > filters.maxSugar) return false;
  return true;
}

// Shown by default when the search box is empty, so users always have a starting point.
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
  "Olive Oil"
];

interface QueueItem {
  ingredient: IngredientSearchResult;
  grams: number;
}

export function RecipeBuilder() {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("Dinner");
  const [instructions, setInstructions] = useState("");

  const [term, setTerm] = useState("");
  const [results, setResults] = useState<IngredientSearchResult[]>([]);
  const [popular, setPopular] = useState<IngredientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterInputs, setFilterInputs] = useState(EMPTY_FILTER_INPUTS);

  const activeFilters = useMemo(() => parseFilters(filterInputs), [filterInputs]);
  const filtersActive = hasActiveFilters(activeFilters);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load a handful of popular staples once, used as the default (empty-search) list.
  useEffect(() => {
    let active = true;
    Promise.all(POPULAR_INGREDIENTS.map((n) => searchIngredients(n, 1)))
      .then((lists) => {
        if (!active) return;
        const seen = new Set<number>();
        const picks: IngredientSearchResult[] = [];
        for (const list of lists) {
          const match = list[0];
          if (match && !seen.has(match.id)) {
            seen.add(match.id);
            picks.push(match);
          }
        }
        setPopular(picks);
      })
      .catch(() => {
        /* non-critical: default list just stays empty */
      });
    return () => {
      active = false;
    };
  }, []);

  // Debounced search; also runs macro-only browse when filters are set without a query.
  useEffect(() => {
    const q = term.trim();
    const shouldSearch = q.length >= 2 || filtersActive;
    if (!shouldSearch) {
      setResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      searchIngredients(q, 25, filtersActive ? activeFilters : undefined)
        .then(setResults)
        .catch((e) => setError(toErrorMessage(e)))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [term, activeFilters, filtersActive]);

  const totals = useMemo(() => {
    const acc = { grams: 0, calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 };
    for (const { ingredient, grams } of queue) {
      const f = grams / 100;
      acc.grams += grams;
      acc.calories += ingredient.caloriesPer100g * f;
      acc.protein += ingredient.proteinPer100g * f;
      acc.carbs += ingredient.carbsPer100g * f;
      acc.fat += ingredient.fatPer100g * f;
      acc.sugar += ingredient.sugarPer100g * f;
    }
    return acc;
  }, [queue]);

  function addToQueue(ingredient: IngredientSearchResult) {
    setQueue((prev) =>
      prev.some((q) => q.ingredient.id === ingredient.id)
        ? prev
        : [...prev, { ingredient, grams: 100 }]
    );
  }

  function setGrams(id: number, grams: number) {
    setQueue((prev) => prev.map((q) => (q.ingredient.id === id ? { ...q, grams } : q)));
  }

  function remove(id: number) {
    setQueue((prev) => prev.filter((q) => q.ingredient.id !== id));
  }

  async function save() {
    if (!name.trim() || queue.length === 0) return;
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      const { id } = await createRecipe({
        name: name.trim(),
        mealType,
        instructions: instructions.trim() || null,
        items: queue.map((q) => ({ ingredientId: q.ingredient.id, quantityGrams: q.grams }))
      });
      setFeedback(`Saved "${name.trim()}" (recipe #${id}). Find it under "Cook for Us".`);
      setName("");
      setInstructions("");
      setQueue([]);
      setTerm("");
      setResults([]);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function setFilter(field: FilterField, value: string) {
    setFilterInputs((prev) => ({ ...prev, [field]: value }));
  }

  function clearFilters() {
    setFilterInputs(EMPTY_FILTER_INPUTS);
  }

  const showDefaults = term.trim().length < 2 && !filtersActive;
  const visibleResults = showDefaults
    ? popular.filter((item) => matchesFilters(item, activeFilters))
    : results;
  const canSave = name.trim().length > 0 && queue.length > 0 && !saving;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: search + results */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-slate-800">1. Find ingredients</h2>
        <p className="mb-4 text-sm text-slate-500">
          Search the food database and add items to your recipe.
        </p>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search e.g. chicken, oats, salmon…"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              showFilters || filtersActive
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {showFilters ? "Hide filters" : "Filter by macros"}
            {filtersActive && !showFilters ? " · active" : ""}
          </button>
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Per 100g
            </p>
            <div className="space-y-2">
              {FILTER_ROWS.map(({ min, max, label, unit }) => (
                <div key={label} className="grid grid-cols-[4.5rem_1fr_1fr] items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">{label}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={filterInputs[min]}
                    onChange={(e) => setFilter(min, e.target.value)}
                    placeholder={`Min ${unit}`}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={filterInputs[max]}
                    onChange={(e) => setFilter(max, e.target.value)}
                    placeholder={`Max ${unit}`}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {showDefaults && popular.length > 0 && (
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Popular ingredients
          </p>
        )}

        {filtersActive && !showDefaults && (
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Filtered results
          </p>
        )}

        <div className="mt-2 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
          {searching && <div className="text-sm text-slate-400">Searching…</div>}
          {!searching && !showDefaults && results.length === 0 && (
            <div className="text-sm text-slate-400">No matches for this search or filter.</div>
          )}
          {!searching && showDefaults && visibleResults.length === 0 && popular.length > 0 && (
            <div className="text-sm text-slate-400">No popular ingredients match these filters.</div>
          )}
          {visibleResults.map((r) => {
            const added = queue.some((q) => q.ingredient.id === r.id);
            return (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    {round(r.caloriesPer100g)} kcal · {round(r.proteinPer100g, 1)}p ·{" "}
                    {round(r.carbsPer100g, 1)}c · {round(r.fatPer100g, 1)}f / 100g
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addToQueue(r)}
                  disabled={added}
                  className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-300"
                >
                  {added ? "Added" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right: the recipe queue */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">2. Build the recipe</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 space-y-2">
          {queue.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
              No ingredients yet — add some from the left.
            </div>
          )}
          {queue.map(({ ingredient, grams }) => (
            <div key={ingredient.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <span className="flex-1 truncate text-sm font-medium text-slate-800">{ingredient.name}</span>
              <input
                type="number"
                min={1}
                value={grams}
                onChange={(e) => setGrams(ingredient.id, Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-indigo-400"
              />
              <span className="text-xs text-slate-400">g</span>
              <button
                type="button"
                onClick={() => remove(ingredient.id)}
                className="ml-1 rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions (optional)"
          rows={2}
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-indigo-50 p-3 text-center sm:grid-cols-6">
          {[
            ["Total", `${round(totals.grams)}g`],
            ["kcal", round(totals.calories)],
            ["Protein", `${round(totals.protein, 1)}g`],
            ["Carbs", `${round(totals.carbs, 1)}g`],
            ["Fat", `${round(totals.fat, 1)}g`],
            ["Sugar", `${round(totals.sugar, 1)}g`]
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-sm font-bold text-indigo-700">{value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-400">{label}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save recipe"}
        </button>

        {feedback && <p className="mt-3 text-sm font-medium text-emerald-600">{feedback}</p>}
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </section>
    </div>
  );
}
