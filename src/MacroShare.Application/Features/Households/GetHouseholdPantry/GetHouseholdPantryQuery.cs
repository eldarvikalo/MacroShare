using MediatR;

namespace MacroShare.Application.Features.Households.GetHouseholdPantry;

public record GetHouseholdPantryQuery(int HouseholdId) : IRequest<List<PantryItemDto>>;
