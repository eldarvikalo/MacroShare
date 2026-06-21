import { useState } from "react";
import { toErrorMessage } from "../api/client";
import { getMealSuggestions } from "../api/services";
import { useAuth } from "../auth/AuthContext";
import type { MealSuggestion, MealType } from "../types";
import { round } from "../utils";
import { NutriScoreBadge } from "./NutriScoreBadge";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function SuggestionsPanel() {
  const { householdId } = useAuth();
  const [type, setType] = useState<MealType>("Dinner");
  const [items, setItems] = useState<MealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load(next: MealType) {
    setType(next);
    setLoading(true);
    setError(null);
    try {
      setItems(await getMealSuggestions(householdId!, next));
      setLoaded(true);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => load(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              type === t && loaded
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        Recipes matching at least 80% of your pantry, ranked healthiest first by Nutri-Score.
      </p>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading && <div className="text-sm text-slate-500">Searching the pantry…</div>}

      {!loading && loaded && items.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          No {type.toLowerCase()} recipes match your pantry yet.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <div key={s.recipeId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <NutriScoreBadge grade={s.nutriScoreGrade} />
                <h3 className="font-semibold text-slate-800">{s.name}</h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {round(s.matchRatio, 0)}% match
              </span>
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <span className="font-semibold text-slate-700">{round(s.totalProtein)}g protein</span>
              <span className="text-slate-400">{round(s.totalSugar)}g sugar</span>
              <span className="text-slate-400">{round(s.totalCalories)} kcal</span>
            </div>
            {s.missingIngredients.length > 0 && (
              <p className="mt-2 text-xs text-amber-600">
                Missing: {s.missingIngredients.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
