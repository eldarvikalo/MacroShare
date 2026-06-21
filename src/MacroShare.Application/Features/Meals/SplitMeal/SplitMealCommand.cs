using MediatR;

namespace MacroShare.Application.Features.Meals.SplitMeal;

/// <summary>
/// Splits a recipe across the selected household members. <paramref name="UserIds"/> may
/// contain 1, 2, or N user ids - the result scales accordingly.
/// </summary>
public record SplitMealCommand(int RecipeId, List<int> UserIds, DateOnly? Date)
    : IRequest<MealSplitResultDto>;
