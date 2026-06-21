using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MediatR;

namespace MacroShare.Application.Features.Recipes.DeleteRecipe;

public class DeleteRecipeCommandHandler : IRequestHandler<DeleteRecipeCommand>
{
    private readonly IRecipeRepository _recipes;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteRecipeCommandHandler(IRecipeRepository recipes, IUnitOfWork unitOfWork)
    {
        _recipes = recipes;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteRecipeCommand request, CancellationToken cancellationToken)
    {
        var recipe = await _recipes.GetWithIngredientsAsync(request.RecipeId, cancellationToken)
            ?? throw new NotFoundException(nameof(Recipe), request.RecipeId);

        // RecipeIngredients cascade; any MealLog references are set null (see EF config).
        _recipes.Remove(recipe);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
