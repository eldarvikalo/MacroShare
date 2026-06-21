import { useEffect, useMemo, useState } from "react";
import { toErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { deleteRecipe, getHouseholdMembers, getRecipes, logMeal, splitMeal } from "../api/services";
import type { HouseholdMember, MealSplitResult, Recipe } from "../types";
import { round } from "../utils";
import { MemberSelector } from "./MemberSelector";
import { NutriScoreBadge } from "./NutriScoreBadge";
import { PlateCard } from "./PlateCard";

export function MealPlanner() {
  const { householdId } = useAuth();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [result, setResult] = useState<MealSplitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logging, setLogging] = useState(false);
  const [mealLogged, setMealLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdId) return;
    let active = true;
    setLoading(true);
    Promise.all([getHouseholdMembers(householdId), getRecipes()])
      .then(([m, r]) => {
        if (!active) return;
        setMembers(m);
        setRecipes(r);
        setSelectedUserIds(m.map((x) => x.id)); // default: cook for everyone
        if (r.length > 0) setSelectedRecipeId(r[0].id);
        setError(null);
      })
      .catch((e) => active && setError(toErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [householdId]);

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId]
  );

  function toggleUser(id: number) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function removeRecipe() {
    if (!selectedRecipe) return;
    if (!window.confirm(`Delete "${selectedRecipe.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteRecipe(selectedRecipe.id);
      const remaining = recipes.filter((r) => r.id !== selectedRecipe.id);
      setRecipes(remaining);
      setSelectedRecipeId(remaining[0]?.id ?? null);
      setResult(null);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  async function cook() {
    if (!selectedRecipeId || selectedUserIds.length === 0) return;
    setCooking(true);
    setError(null);
    try {
      const data = await splitMeal({ recipeId: selectedRecipeId, userIds: selectedUserIds });
      setResult(data);
      setMealLogged(false);
    } catch (e) {
      setError(toErrorMessage(e));
      setResult(null);
    } finally {
      setCooking(false);
    }
  }

  async function logCookedMeal() {
    if (!result || !selectedRecipe) return;
    setLogging(true);
    setError(null);
    try {
      await logMeal({
        recipeId: result.recipeId,
        mealType: selectedRecipe.mealType,
        portions: result.portions.map((p) => ({
          userId: p.userId,
          portionGrams: p.portionGrams,
          calories: p.calories,
          protein: p.protein,
          carbs: p.carbs,
          fat: p.fat,
          sugar: p.sugar
        }))
      });
      setMealLogged(true);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLogging(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">Loading household…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">Recipe</label>
              {selectedRecipe && (
                <button
                  type="button"
                  onClick={removeRecipe}
                  disabled={deleting}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete recipe"}
                </button>
              )}
            </div>
            {recipes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                No recipes yet. Create one under "Build a Recipe".
              </p>
            ) : (
              <select
                value={selectedRecipeId ?? ""}
                onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.mealType}
                  </option>
                ))}
              </select>
            )}
            {selectedRecipe && (
              <>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <NutriScoreBadge grade={selectedRecipe.nutriScoreGrade} size="md" />
                  <span className="font-medium">Nutri-Score {selectedRecipe.nutriScoreGrade}</span>
                  <span className="text-slate-400">
                    · {round(selectedRecipe.totalCalories)} kcal · {round(selectedRecipe.totalProtein)}g protein total
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedRecipe.ingredients
                    .map((i) => `${round(i.quantityGrams)}g ${i.name}`)
                    .join(" · ")}
                </p>
              </>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Who's eating?
            </label>
            <MemberSelector
              members={members}
              selectedIds={selectedUserIds}
              onToggle={toggleUser}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={cook}
            disabled={cooking || !selectedRecipeId || selectedUserIds.length === 0}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cooking ? "Splitting…" : "Cook for Us"}
          </button>
          <span className="text-sm text-slate-500">
            {selectedUserIds.length} {selectedUserIds.length === 1 ? "person" : "people"} selected
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{result.recipeName} · plates</h2>
              <button
                type="button"
                onClick={logCookedMeal}
                disabled={logging || mealLogged}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300"
              >
                {mealLogged ? "Logged today" : logging ? "Logging…" : "Log this meal"}
              </button>
            </div>
            <span className="text-sm text-slate-500">
              Whole meal: {round(result.totalMeal.totalGrams)}g · {round(result.totalMeal.calories)} kcal ·{" "}
              {round(result.totalMeal.protein)}g protein
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.portions.map((p, idx) => (
              <PlateCard key={p.userId} portion={p} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
