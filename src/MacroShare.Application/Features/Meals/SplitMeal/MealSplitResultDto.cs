using MacroShare.Application.Common.Models;

namespace MacroShare.Application.Features.Meals.SplitMeal;

public record MealSplitResultDto(
    int RecipeId,
    string RecipeName,
    MacrosDto TotalMeal,
    IReadOnlyList<PersonPortionDto> Portions);
