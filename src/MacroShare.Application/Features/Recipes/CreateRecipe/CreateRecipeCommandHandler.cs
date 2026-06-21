using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MediatR;

namespace MacroShare.Application.Features.Recipes.CreateRecipe;

public class CreateRecipeCommandHandler : IRequestHandler<CreateRecipeCommand, int>
{
    private readonly IRecipeRepository _recipes;
    private readonly IIngredientRepository _ingredients;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRecipeCommandHandler(
        IRecipeRepository recipes,
        IIngredientRepository ingredients,
        IUnitOfWork unitOfWork)
    {
        _recipes = recipes;
        _ingredients = ingredients;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(CreateRecipeCommand request, CancellationToken cancellationToken)
    {
        var ingredientIds = request.Items.Select(i => i.IngredientId).ToList();
        var existing = await _ingredients.GetExistingIdsAsync(ingredientIds, cancellationToken);

        var missing = ingredientIds.Where(id => !existing.Contains(id)).Distinct().ToList();
        if (missing.Count != 0)
            throw new NotFoundException($"Ingredient(s) not found: {string.Join(", ", missing)}.");

        var recipe = new Recipe
        {
            Name = request.Name.Trim(),
            MealType = request.MealType,
            Instructions = string.IsNullOrWhiteSpace(request.Instructions) ? null : request.Instructions.Trim(),
            Ingredients = request.Items
                // Merge duplicate ingredient lines so the unique (RecipeId, IngredientId) index holds.
                .GroupBy(i => i.IngredientId)
                .Select(g => new RecipeIngredient
                {
                    IngredientId = g.Key,
                    QuantityGrams = g.Sum(x => x.QuantityGrams)
                })
                .ToList()
        };

        await _recipes.AddAsync(recipe, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return recipe.Id;
    }
}
