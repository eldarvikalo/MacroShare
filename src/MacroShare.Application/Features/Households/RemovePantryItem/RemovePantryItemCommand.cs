using MediatR;

namespace MacroShare.Application.Features.Households.RemovePantryItem;

public record RemovePantryItemCommand(int HouseholdId, int IngredientId) : IRequest;
