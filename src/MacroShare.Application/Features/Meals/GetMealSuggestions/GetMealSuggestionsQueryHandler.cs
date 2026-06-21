using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Services;
using MediatR;

namespace MacroShare.Application.Features.Meals.GetMealSuggestions;

public class GetMealSuggestionsQueryHandler
    : IRequestHandler<GetMealSuggestionsQuery, List<MealSuggestionDto>>
{
    private const decimal MinMatchRatio = 0.80m;
    private const int MaxResults = 50;

    // Scoring weights: reward protein, penalize sugar (couple avoids processed sugar).
    private const decimal ProteinWeight = 1.0m;
    private const decimal SugarWeight = 2.0m;

    private readonly IRecipeRepository _recipes;
    private readonly IPantryRepository _pantry;

    public GetMealSuggestionsQueryHandler(IRecipeRepository recipes, IPantryRepository pantry)
    {
        _recipes = recipes;
        _pantry = pantry;
    }

    public async Task<List<MealSuggestionDto>> Handle(
        GetMealSuggestionsQuery request,
        CancellationToken cancellationToken)
    {
        var pantryIngredientIds = await _pantry.GetIngredientIdsAsync(request.HouseholdId, cancellationToken);
        var recipes = await _recipes.GetByMealTypeWithIngredientsAsync(request.Type, cancellationToken);

        var suggestions = new List<(MealSuggestionDto Dto, int NutriPoints, decimal Score)>();

        foreach (var recipe in recipes)
        {
            var ingredients = recipe.Ingredients.ToList();
            if (ingredients.Count == 0)
                continue;

            var matched = ingredients.Count(ri => pantryIngredientIds.Contains(ri.IngredientId));
            var matchRatio = (decimal)matched / ingredients.Count;

            if (matchRatio < MinMatchRatio)
                continue;

            decimal grams = 0, protein = 0, sugar = 0, fat = 0, calories = 0;
            var missing = new List<string>();

            foreach (var ri in ingredients)
            {
                if (ri.Ingredient is not null)
                {
                    var factor = ri.QuantityGrams / 100m;
                    grams += ri.QuantityGrams;
                    protein += ri.Ingredient.ProteinPer100g * factor;
                    sugar += ri.Ingredient.SugarPer100g * factor;
                    fat += ri.Ingredient.FatPer100g * factor;
                    calories += ri.Ingredient.CaloriesPer100g * factor;
                }

                if (!pantryIngredientIds.Contains(ri.IngredientId))
                    missing.Add(ri.Ingredient?.Name ?? $"Ingredient #{ri.IngredientId}");
            }

            var nutri = NutriScoreCalculator.Evaluate(grams, calories, protein, fat, sugar);
            var score = (protein * ProteinWeight) - (sugar * SugarWeight);

            var dto = new MealSuggestionDto(
                recipe.Id,
                recipe.Name,
                recipe.MealType,
                Math.Round(matchRatio * 100m, 1),
                Math.Round(protein, 1),
                Math.Round(sugar, 1),
                Math.Round(calories, 1),
                nutri.Grade,
                missing);

            suggestions.Add((dto, nutri.Points, score));
        }

        // Healthiest first (lower Nutri-Score points = better), then by our protein/sugar score.
        return suggestions
            .OrderBy(s => s.NutriPoints)
            .ThenByDescending(s => s.Score)
            .ThenByDescending(s => s.Dto.MatchRatio)
            .Take(MaxResults)
            .Select(s => s.Dto)
            .ToList();
    }
}
