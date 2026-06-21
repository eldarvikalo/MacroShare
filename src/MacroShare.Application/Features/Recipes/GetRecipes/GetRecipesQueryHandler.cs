using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Services;
using MediatR;

namespace MacroShare.Application.Features.Recipes.GetRecipes;

public class GetRecipesQueryHandler : IRequestHandler<GetRecipesQuery, List<RecipeDto>>
{
    private readonly IRecipeRepository _recipes;

    public GetRecipesQueryHandler(IRecipeRepository recipes) => _recipes = recipes;

    public async Task<List<RecipeDto>> Handle(GetRecipesQuery request, CancellationToken cancellationToken)
    {
        var recipes = await _recipes.GetAllAsync(cancellationToken);

        return recipes
            .Select(r =>
            {
                decimal grams = 0, calories = 0, protein = 0, fat = 0, sugar = 0;
                foreach (var ri in r.Ingredients)
                {
                    if (ri.Ingredient is null) continue;
                    var f = ri.QuantityGrams / 100m;
                    grams += ri.QuantityGrams;
                    calories += ri.Ingredient.CaloriesPer100g * f;
                    protein += ri.Ingredient.ProteinPer100g * f;
                    fat += ri.Ingredient.FatPer100g * f;
                    sugar += ri.Ingredient.SugarPer100g * f;
                }

                var nutri = NutriScoreCalculator.Evaluate(grams, calories, protein, fat, sugar);

                return new RecipeDto(
                    r.Id,
                    r.Name,
                    r.MealType,
                    r.Instructions,
                    nutri.Grade,
                    Math.Round(calories, 1),
                    Math.Round(protein, 1),
                    r.Ingredients
                        .Select(ri => new RecipeIngredientDto(
                            ri.IngredientId,
                            ri.Ingredient?.Name ?? string.Empty,
                            ri.QuantityGrams))
                        .ToList());
            })
            .ToList();
    }
}
