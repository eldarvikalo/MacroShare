using MacroShare.Domain.Enums;
using MediatR;

namespace MacroShare.Application.Features.Meals.LogMeal;

public record LogMealCommand(
    int RecipeId,
    MealType MealType,
    DateOnly? Date,
    List<LogMealPortion> Portions) : IRequest;

public record LogMealPortion(
    int UserId,
    decimal PortionGrams,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal Sugar);
