using MacroShare.Domain.Enums;

namespace MacroShare.Application.Features.Recipes.GetRecipes;

public record RecipeIngredientDto(int IngredientId, string Name, decimal QuantityGrams);

public record RecipeDto(
    int Id,
    string Name,
    MealType MealType,
    string? Instructions,
    string NutriScoreGrade,
    decimal TotalCalories,
    decimal TotalProtein,
    IReadOnlyList<RecipeIngredientDto> Ingredients);
