using MacroShare.Domain.Enums;

namespace MacroShare.Application.Features.Meals.GetMealSuggestions;

public record MealSuggestionDto(
    int RecipeId,
    string Name,
    MealType MealType,
    decimal MatchRatio,
    decimal TotalProtein,
    decimal TotalSugar,
    decimal TotalCalories,
    string NutriScoreGrade,
    IReadOnlyList<string> MissingIngredients);
