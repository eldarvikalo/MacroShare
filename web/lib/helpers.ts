import type { HouseholdMember, IngredientCategory, MealSuggestion, Recipe } from "@/lib/types"
import { initials } from "@/lib/utils"

export function householdLabel(members: HouseholdMember[]): string {
  if (members.length === 0) return "Household"
  if (members.length <= 2) {
    return `${members.map((m) => m.name).join(" & ")} Home`
  }
  return `${members[0].name}'s household`
}

export function memberColor(member: HouseholdMember, index: number): string {
  return member.avatarColor ?? ["#2563eb", "#db2777", "#16a34a", "#d97706"][index % 4]
}

export function memberInitial(member: HouseholdMember): string {
  return initials(member.name)
}

export function recipeTotalGrams(recipe: Recipe): number {
  return recipe.ingredients.reduce((sum, item) => sum + item.quantityGrams, 0)
}

export function formatTodayLabel(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatMealTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "today"
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function deriveIngredientCategory(name: string): IngredientCategory {
  const n = name.toLowerCase()
  if (
    /chicken|beef|turkey|salmon|cod|tuna|shrimp|egg|tofu|protein|mince|steak|fillet/.test(n)
  ) {
    return "Protein"
  }
  if (/rice|oats|quinoa|lentil|chickpea|bean|bread|pasta/.test(n)) return "Grain"
  if (/yogurt|cheese|milk|cottage/.test(n)) return "Dairy"
  if (/oil|almond|walnut|chia|honey|butter/.test(n)) return "Fat"
  if (/banana|apple|blueberr|strawberr|avocado/.test(n)) return "Fruit"
  return "Veg"
}

export function suggestionTags(suggestion: MealSuggestion): string[] {
  const tags: string[] = []
  if (suggestion.totalProtein >= 40) tags.push("High Protein")
  if (suggestion.totalSugar <= 10) tags.push("Low Sugar")
  if (suggestion.matchRatio >= 100) tags.push("Pantry Ready")
  return tags
}

export function progressStatus(progress: {
  consumedCalories: number
  targetCalories: number
  consumedProtein: number
  targetProtein: number
}): string {
  const overCalories = progress.consumedCalories > progress.targetCalories
  const overProtein = progress.consumedProtein > progress.targetProtein
  if (overCalories || overProtein) return "Needs attention"
  const calPct = progress.targetCalories
    ? progress.consumedCalories / progress.targetCalories
    : 0
  if (calPct >= 0.85) return "Almost full"
  return "On track"
}
