using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Application.Features.Households.GetHouseholdPantry;
using MacroShare.Domain.Entities;
using MediatR;

namespace MacroShare.Application.Features.Households.AddPantryItem;

public class AddPantryItemCommandHandler : IRequestHandler<AddPantryItemCommand, PantryItemDto>
{
    private readonly IPantryRepository _pantry;
    private readonly IIngredientRepository _ingredients;
    private readonly IUnitOfWork _unitOfWork;

    public AddPantryItemCommandHandler(
        IPantryRepository pantry,
        IIngredientRepository ingredients,
        IUnitOfWork unitOfWork)
    {
        _pantry = pantry;
        _ingredients = ingredients;
        _unitOfWork = unitOfWork;
    }

    public async Task<PantryItemDto> Handle(AddPantryItemCommand request, CancellationToken cancellationToken)
    {
        var existingIds = await _ingredients.GetExistingIdsAsync([request.IngredientId], cancellationToken);
        if (!existingIds.Contains(request.IngredientId))
            throw new NotFoundException("Ingredient", request.IngredientId);

        var item = await _pantry.FindItemAsync(request.HouseholdId, request.IngredientId, cancellationToken);
        if (item is not null)
        {
            item.QuantityGrams += request.QuantityGrams;
        }
        else
        {
            var pantryId = await _pantry.GetPantryIdForHouseholdAsync(request.HouseholdId, cancellationToken);
            await _pantry.AddItemAsync(new PantryItem
            {
                PantryId = pantryId,
                IngredientId = request.IngredientId,
                QuantityGrams = request.QuantityGrams
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = await _pantry.GetItemDtoAsync(request.HouseholdId, request.IngredientId, cancellationToken);
        return dto ?? throw new NotFoundException("Pantry item", request.IngredientId);
    }
}
