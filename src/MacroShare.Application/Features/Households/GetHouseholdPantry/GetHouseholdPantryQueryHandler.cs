using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Households.GetHouseholdPantry;

public class GetHouseholdPantryQueryHandler
    : IRequestHandler<GetHouseholdPantryQuery, List<PantryItemDto>>
{
    private readonly IPantryRepository _pantry;

    public GetHouseholdPantryQueryHandler(IPantryRepository pantry) => _pantry = pantry;

    public async Task<List<PantryItemDto>> Handle(
        GetHouseholdPantryQuery request,
        CancellationToken cancellationToken)
        => (await _pantry.GetItemsAsync(request.HouseholdId, cancellationToken)).ToList();
}
