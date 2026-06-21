import { apiClient } from "./client";
import type {
  AddCustomIngredientRequest,
  BodyCompositionEntry,
  CreateRecipeRequest,
  CurrentUser,
  DailyProgress,
  HouseholdMember,
  IngredientSearchFilters,
  IngredientSearchResult,
  LogBodyCompositionRequest,
  LogMealRequest,
  LoginResult,
  MealSplitResult,
  MealSuggestion,
  MealType,
  Recipe,
  SplitMealRequest,
  UpdateProfileRequest
} from "../types";

export async function login(email: string, password: string): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>("/api/auth/login", { email, password });
  return data;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>("/api/auth/me");
  return data;
}

export async function getHouseholdMembers(householdId: number): Promise<HouseholdMember[]> {
  const { data } = await apiClient.get<HouseholdMember[]>(
    `/api/households/${householdId}/members`
  );
  return data;
}

export async function getRecipes(): Promise<Recipe[]> {
  const { data } = await apiClient.get<Recipe[]>("/api/recipes");
  return data;
}

export async function splitMeal(request: SplitMealRequest): Promise<MealSplitResult> {
  const { data } = await apiClient.post<MealSplitResult>("/api/meals/split", request);
  return data;
}

export async function getMealSuggestions(
  householdId: number,
  type: MealType
): Promise<MealSuggestion[]> {
  const { data } = await apiClient.get<MealSuggestion[]>(
    `/api/households/${householdId}/meal-suggestions`,
    { params: { type } }
  );
  return data;
}

export async function addCustomIngredient(
  request: AddCustomIngredientRequest
): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ id: number }>("/api/ingredients/custom", request);
  return data;
}

export async function searchIngredients(
  search: string,
  take = 25,
  filters?: IngredientSearchFilters
): Promise<IngredientSearchResult[]> {
  const { data } = await apiClient.get<IngredientSearchResult[]>("/api/ingredients", {
    params: { search, take, ...filters }
  });
  return data;
}

export async function createRecipe(request: CreateRecipeRequest): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ id: number }>("/api/recipes", request);
  return data;
}

export async function deleteRecipe(id: number): Promise<void> {
  await apiClient.delete(`/api/recipes/${id}`);
}

export async function getBodyCompositionHistory(
  userId?: number,
  take = 30
): Promise<BodyCompositionEntry[]> {
  const { data } = await apiClient.get<BodyCompositionEntry[]>("/api/account/body-composition", {
    params: { userId, take }
  });
  return data;
}

export async function logBodyComposition(
  request: LogBodyCompositionRequest
): Promise<BodyCompositionEntry> {
  const { data } = await apiClient.post<BodyCompositionEntry>(
    "/api/account/body-composition",
    request
  );
  return data;
}

export async function updateProfile(request: UpdateProfileRequest) {
  const { data } = await apiClient.patch("/api/account/profile", request);
  return data;
}

export async function getDailyProgress(date?: string): Promise<DailyProgress[]> {
  const { data } = await apiClient.get<DailyProgress[]>("/api/account/daily-progress", {
    params: date ? { date } : undefined
  });
  return data;
}

export async function logMeal(request: LogMealRequest): Promise<void> {
  await apiClient.post("/api/meals/log", request);
}
