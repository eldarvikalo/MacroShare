using MediatR;
using MacroShare.Application.Features.Households.GetHouseholdPantry;

namespace MacroShare.Application.Features.Households.AddPantryItem;

public record AddPantryItemCommand(int HouseholdId, int IngredientId, decimal QuantityGrams)
    : IRequest<PantryItemDto>;
