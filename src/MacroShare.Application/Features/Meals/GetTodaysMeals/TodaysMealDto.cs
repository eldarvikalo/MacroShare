using MacroShare.Domain.Enums;

namespace MacroShare.Application.Features.Meals.GetTodaysMeals;

public record TodaysMealPortionDto(
    int UserId,
    string Name,
    string? AvatarColor,
    decimal PortionGrams,
    decimal Calories,
    decimal Protein);

public record TodaysMealDto(
    int MealLogId,
    MealType MealType,
    string RecipeName,
    DateTime LoggedAt,
    IReadOnlyList<TodaysMealPortionDto> Portions);
