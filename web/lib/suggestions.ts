import type { MealSuggestion, LoggedMeal } from "./types"
import { RECIPES } from "./recipes"
import { PANTRY_NAMES } from "./pantry"

function deriveTags(protein: number, sugar: number, mealType: string, grams: number): string[] {
  const tags: string[] = []
  if (protein / grams >= 0.08) tags.push("High Protein")
  if (sugar <= 4) tags.push("Low Sugar")
  return tags
}

// Build suggestions from recipes using pantry match logic (>= 80%).
export const SUGGESTIONS: MealSuggestion[] = RECIPES.map((r) => {
  const missing = r.ingredients.filter((ing) => !PANTRY_NAMES.has(ing.name)).map((ing) => ing.name)
  const matchRatio = Math.round(((r.ingredients.length - missing.length) / r.ingredients.length) * 100)
  const tags = deriveTags(r.protein, r.sugar, r.mealType, r.totalGrams)
  if ((r.mealType === "Dinner" || r.mealType === "Lunch") && r.protein / r.totalGrams < 0.06) {
    tags.push("Veg-Forward")
  }
  return {
    recipeId: r.id,
    name: r.name,
    mealType: r.mealType,
    matchRatio,
    totalProtein: r.protein,
    totalSugar: r.sugar,
    totalCalories: r.calories,
    nutriScoreGrade: r.nutriScoreGrade,
    missingIngredients: missing,
    tags,
  }
})

const GRADE_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 }

export function getSuggestions(mealType: string): MealSuggestion[] {
  return SUGGESTIONS.filter((s) => s.mealType === mealType && s.matchRatio >= 80).sort((a, b) => {
    if (GRADE_ORDER[a.nutriScoreGrade] !== GRADE_ORDER[b.nutriScoreGrade]) {
      return GRADE_ORDER[a.nutriScoreGrade] - GRADE_ORDER[b.nutriScoreGrade]
    }
    const scoreA = a.totalProtein - a.totalSugar
    const scoreB = b.totalProtein - b.totalSugar
    if (scoreA !== scoreB) return scoreB - scoreA
    return b.matchRatio - a.matchRatio
  })
}

export const TODAYS_MEALS: LoggedMeal[] = [
  {
    mealType: "Breakfast",
    recipeName: "Protein Power Oats",
    time: "8:12 AM",
    portions: [
      { name: "Eldar", grams: 312, calories: 487, protein: 38 },
      { name: "Dina", grams: 138, calories: 215, protein: 17 },
    ],
  },
]
