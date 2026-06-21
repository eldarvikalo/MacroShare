using MediatR;

namespace MacroShare.Application.Features.Ingredients.AddCustomIngredient;

public record AddCustomIngredientCommand(
    string Name,
    decimal CaloriesPer100g,
    decimal ProteinPer100g,
    decimal CarbsPer100g,
    decimal FatPer100g,
    decimal SugarPer100g) : IRequest<int>;
