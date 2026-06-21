using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Ingredients.SearchIngredients;

public class SearchIngredientsQueryHandler
    : IRequestHandler<SearchIngredientsQuery, List<IngredientDto>>
{
    private const int MaxTake = 50;

    private readonly IIngredientRepository _ingredients;

    public SearchIngredientsQueryHandler(IIngredientRepository ingredients)
        => _ingredients = ingredients;

    public async Task<List<IngredientDto>> Handle(
        SearchIngredientsQuery request,
        CancellationToken cancellationToken)
    {
        var take = Math.Clamp(request.Take, 1, MaxTake);
        var results = await _ingredients.SearchAsync(
            request.Search ?? string.Empty,
            take,
            request.Filters,
            cancellationToken);

        return results
            .Select(i => new IngredientDto(
                i.Id,
                i.Name,
                i.CaloriesPer100g,
                i.ProteinPer100g,
                i.CarbsPer100g,
                i.FatPer100g,
                i.SugarPer100g,
                i.IsCustom))
            .ToList();
    }
}
