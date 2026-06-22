// Per-100g macros for the ingredient search in Build a Recipe.
export interface IngredientMacro {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

export const INGREDIENT_DB: IngredientMacro[] = [
  { name: "Chicken Breast (raw)", calories: 120, protein: 23, carbs: 0, fat: 2.6, sugar: 0 },
  { name: "Egg (whole)", calories: 143, protein: 13, carbs: 1.1, fat: 9.5, sugar: 1.1 },
  { name: "White Rice (cooked)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, sugar: 0.1 },
  { name: "Rolled Oats", calories: 379, protein: 13, carbs: 67, fat: 6.5, sugar: 1 },
  { name: "Salmon Fillet", calories: 208, protein: 20, carbs: 0, fat: 13, sugar: 0 },
  { name: "Lean Beef Mince (5% fat)", calories: 137, protein: 21, carbs: 0, fat: 5, sugar: 0 },
  { name: "Greek Yogurt (0% fat)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, sugar: 3.2 },
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, sugar: 1.7 },
  { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, sugar: 4.2 },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, sugar: 12 },
  { name: "Almonds", calories: 579, protein: 21, carbs: 22, fat: 50, sugar: 4.4 },
  { name: "Olive Oil", calories: 884, protein: 0, carbs: 0, fat: 100, sugar: 0 },
  { name: "Whey Protein Powder", calories: 400, protein: 80, carbs: 8, fat: 6, sugar: 4 },
  { name: "Quinoa (cooked)", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, sugar: 0.9 },
  { name: "Chickpeas (cooked)", calories: 164, protein: 9, carbs: 27, fat: 2.6, sugar: 4.8 },
  { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sugar: 0.4 },
  { name: "Tofu (firm)", calories: 144, protein: 17, carbs: 3, fat: 9, sugar: 0.6 },
  { name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, sugar: 2.7 },
  { name: "Cod Fillet", calories: 82, protein: 18, carbs: 0, fat: 0.7, sugar: 0 },
  { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, sugar: 10 },
  { name: "Honey", calories: 304, protein: 0.3, carbs: 82, fat: 0, sugar: 82 },
]

export const POPULAR_INGREDIENTS = [
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
  "Olive Oil",
]
