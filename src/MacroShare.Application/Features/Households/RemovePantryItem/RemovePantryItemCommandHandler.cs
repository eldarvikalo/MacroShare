using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Households.RemovePantryItem;

public class RemovePantryItemCommandHandler : IRequestHandler<RemovePantryItemCommand>
{
    private readonly IPantryRepository _pantry;
    private readonly IUnitOfWork _unitOfWork;

    public RemovePantryItemCommandHandler(IPantryRepository pantry, IUnitOfWork unitOfWork)
    {
        _pantry = pantry;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RemovePantryItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _pantry.FindItemAsync(request.HouseholdId, request.IngredientId, cancellationToken)
            ?? throw new NotFoundException("Pantry item", request.IngredientId);

        await _pantry.RemoveItemAsync(item, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
