using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Application.Features.Households.GetHouseholdPantry;
using MediatR;

namespace MacroShare.Application.Features.Households.UpdatePantryItem;

public class UpdatePantryItemCommandHandler : IRequestHandler<UpdatePantryItemCommand, PantryItemDto>
{
    private readonly IPantryRepository _pantry;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePantryItemCommandHandler(IPantryRepository pantry, IUnitOfWork unitOfWork)
    {
        _pantry = pantry;
        _unitOfWork = unitOfWork;
    }

    public async Task<PantryItemDto> Handle(UpdatePantryItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _pantry.FindItemAsync(request.HouseholdId, request.IngredientId, cancellationToken)
            ?? throw new NotFoundException("Pantry item", request.IngredientId);

        item.QuantityGrams = request.QuantityGrams;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = await _pantry.GetItemDtoAsync(request.HouseholdId, request.IngredientId, cancellationToken);
        return dto ?? throw new NotFoundException("Pantry item", request.IngredientId);
    }
}
