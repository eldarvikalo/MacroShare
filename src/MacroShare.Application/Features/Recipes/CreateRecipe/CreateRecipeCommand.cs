using MacroShare.Domain.Enums;
using MediatR;

namespace MacroShare.Application.Features.Recipes.CreateRecipe;

public record CreateRecipeItem(int IngredientId, decimal QuantityGrams);

public record CreateRecipeCommand(
    string Name,
    MealType MealType,
    string? Instructions,
    List<CreateRecipeItem> Items) : IRequest<int>;
