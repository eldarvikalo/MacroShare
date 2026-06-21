import type { Recipe, DailyProgress, MealSplitResult, PersonPortion } from "./types"
import { MEMBERS } from "./members"

/**
 * Smart split by remaining calories.
 * For each participant: demand = max(targetCalories - consumedToday, 1)
 * ratio = demand / sum(all demands). Scale grams and macros by ratio.
 */
export function splitMeal(
  recipe: Recipe,
  participantIds: number[],
  progress: DailyProgress[]
): MealSplitResult {
  const demands = participantIds.map((id) => {
    const p = progress.find((d) => d.userId === id)
    const target = p?.targetCalories ?? 0
    const consumed = p?.consumedCalories ?? 0
    return { id, demand: Math.max(target - consumed, 1) }
  })

  const totalDemand = demands.reduce((sum, d) => sum + d.demand, 0)

  const portions: PersonPortion[] = demands.map(({ id, demand }) => {
    const member = MEMBERS.find((m) => m.id === id)!
    const ratio = demand / totalDemand
    return {
      userId: id,
      name: member.name,
      initial: member.initial,
      avatarColor: member.avatarColor,
      ratioPercent: round1(ratio * 100),
      portionGrams: Math.round(recipe.totalGrams * ratio),
      calories: Math.round(recipe.calories * ratio),
      protein: Math.round(recipe.protein * ratio),
      carbs: Math.round(recipe.carbs * ratio),
      fat: Math.round(recipe.fat * ratio),
      sugar: Math.round(recipe.sugar * ratio),
    }
  })

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    totalMeal: {
      totalGrams: recipe.totalGrams,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      sugar: recipe.sugar,
    },
    portions,
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function estimateNutriScore(per: {
  protein: number
  sugar: number
  fat: number
  calories: number
  grams: number
}): "A" | "B" | "C" | "D" | "E" {
  const proteinPer100 = (per.protein / per.grams) * 100
  const sugarPer100 = (per.sugar / per.grams) * 100
  const score = proteinPer100 * 2 - sugarPer100 * 1.5 - (per.fat / per.grams) * 100
  if (score > 25) return "A"
  if (score > 15) return "B"
  if (score > 5) return "C"
  if (score > -5) return "D"
  return "E"
}
