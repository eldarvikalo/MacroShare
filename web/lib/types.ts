export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack"
export type Sex = "Male" | "Female" | "Other"
export type NutriGrade = "A" | "B" | "C" | "D" | "E"
export type IngredientCategory = "Protein" | "Grain" | "Veg" | "Dairy" | "Fat" | "Fruit"

export interface HouseholdMember {
  id: number
  name: string
  sex: Sex
  heightCm: number
  weightKg: number
  bmr: number
  tdee: number
  targetCalories: number
  targetProtein: number
  avatarColor: string | null
}

export interface LoginResult {
  token: string
  userId: number
  householdId: number
  name: string
  email: string
  avatarColor: string | null
}

export interface CurrentUser {
  id: number
  householdId: number
  name: string
  email: string
  sex: Sex
  age: number | null
  heightCm: number
  weightKg: number
  bmr: number
  tdee: number
  targetCalories: number
  targetProtein: number
  avatarColor: string | null
  latestWeightKg: number | null
  latestBodyFatPercent: number | null
  latestMeasuredAt: string | null
}

export interface BodyCompositionEntry {
  id: number
  userId: number
  userName: string
  measuredAt: string
  weightKg: number
  bmi: number | null
  bodyFatPercent: number | null
  bodyScore: number | null
  bmr: number | null
  muscleMassKg: number | null
  fatMassKg: number | null
  bodyWaterPercent: number | null
  visceralFatRating: number | null
  standardWeightKg: number | null
  weightControlKg: number | null
  fatControlKg: number | null
  bodyTypeLabel: string | null
  notes: string | null
}

export interface LogBodyCompositionRequest {
  measuredAt: string
  weightKg: number
  bmi?: number | null
  bodyFatPercent?: number | null
  bodyScore?: number | null
  bmr?: number | null
  muscleMassKg?: number | null
  fatMassKg?: number | null
  bodyWaterPercent?: number | null
  visceralFatRating?: number | null
  standardWeightKg?: number | null
  weightControlKg?: number | null
  fatControlKg?: number | null
  bodyTypeLabel?: string | null
  notes?: string | null
  applyToProfile?: boolean
  recalculateTargets?: boolean
}

export interface DailyProgress {
  userId: number
  name: string
  avatarColor: string | null
  targetCalories: number
  targetProtein: number
  consumedCalories: number
  consumedProtein: number
  consumedCarbs: number
  consumedFat: number
  remainingCalories: number
  remainingProtein: number
}

export interface UpdateProfileRequest {
  targetCalories?: number | null
  targetProtein?: number | null
  activityMultiplier?: number | null
  heightCm?: number | null
}

export interface LogMealRequest {
  recipeId: number
  mealType: MealType
  date?: string | null
  portions: {
    userId: number
    portionGrams: number
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }[]
}

export interface RecipeIngredient {
  ingredientId: number
  name: string
  quantityGrams: number
}

export interface Recipe {
  id: number
  name: string
  mealType: MealType
  instructions: string | null
  nutriScoreGrade: string
  totalCalories: number
  totalProtein: number
  ingredients: RecipeIngredient[]
}

export interface PersonPortion {
  userId: number
  name: string
  avatarColor: string | null
  ratioPercent: number
  portionGrams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
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
  nutriScoreGrade: string
  missingIngredients: string[]
}

export interface PantryItem {
  id: number
  ingredientId: number
  name: string
  quantityGrams: number
}

export interface TodaysMealPortion {
  userId: number
  name: string
  avatarColor: string | null
  portionGrams: number
  calories: number
  protein: number
}

export interface TodaysMeal {
  mealLogId: number
  mealType: MealType
  recipeName: string
  loggedAt: string
  portions: TodaysMealPortion[]
}

export interface SplitMealRequest {
  recipeId: number
  userIds: number[]
  date?: string | null
}

export interface AddCustomIngredientRequest {
  name: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  sugarPer100g: number
}

export interface IngredientSearchResult {
  id: number
  name: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  sugarPer100g: number
  isCustom: boolean
}

export interface IngredientSearchFilters {
  minCalories?: number
  maxCalories?: number
  minProtein?: number
  maxProtein?: number
  minCarbs?: number
  maxCarbs?: number
  minFat?: number
  maxFat?: number
  minSugar?: number
  maxSugar?: number
}

export interface CreateRecipeItem {
  ingredientId: number
  quantityGrams: number
}

export interface CreateRecipeRequest {
  name: string
  mealType: MealType
  instructions?: string | null
  items: CreateRecipeItem[]
}
