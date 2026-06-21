export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack"
export type NutriGrade = "A" | "B" | "C" | "D" | "E"
export type IngredientCategory = "Protein" | "Grain" | "Veg" | "Dairy" | "Fat" | "Fruit"

export interface HouseholdMember {
  id: number
  name: string
  initial: string
  email: string
  sex: "Male" | "Female"
  age: number
  heightCm: number
  weightKg: number
  bmr: number
  activityMultiplier: number
  tdee: number
  targetCalories: number
  targetProtein: number
  avatarColor: string
  profile: string
}

export interface DailyProgress {
  userId: number
  name: string
  targetCalories: number
  targetProtein: number
  consumedCalories: number
  consumedProtein: number
  consumedCarbs: number
  consumedFat: number
  remainingCalories: number
  remainingProtein: number
}

export interface PersonPortion {
  userId: number
  name: string
  initial: string
  avatarColor: string
  ratioPercent: number
  portionGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

export interface RecipeIngredient {
  name: string
  grams: number
}

export interface Recipe {
  id: number
  name: string
  mealType: MealType
  nutriScoreGrade: NutriGrade
  totalGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  ingredients: RecipeIngredient[]
}

export interface MealSplitResult {
  recipeId: number
  recipeName: string
  totalMeal: {
    totalGrams: number
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
  portions: PersonPortion[]
}

export interface MealSuggestion {
  recipeId: number
  name: string
  mealType: MealType
  matchRatio: number
  totalProtein: number
  totalSugar: number
  totalCalories: number
  nutriScoreGrade: NutriGrade
  missingIngredients: string[]
  tags: string[]
}

export interface PantryItem {
  name: string
  grams: number
  category: IngredientCategory
}

export interface ScaleReading {
  date: string
  weightKg: number
  bodyFatPercent: number
  changeKg: number
}

export interface LoggedMeal {
  mealType: MealType
  recipeName: string
  time: string
  portions: { name: string; grams: number; calories: number; protein: number }[]
}
