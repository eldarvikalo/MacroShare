using MediatR;
using MacroShare.Application.Features.Households.GetHouseholdPantry;

namespace MacroShare.Application.Features.Households.UpdatePantryItem;

public record UpdatePantryItemCommand(int HouseholdId, int IngredientId, decimal QuantityGrams)
    : IRequest<PantryItemDto>;
