using MediatR;

namespace MacroShare.Application.Features.Ingredients.SearchIngredients;

public record SearchIngredientsQuery(
    string? Search,
    int Take = 25,
    IngredientMacroFilters? Filters = null)
    : IRequest<List<IngredientDto>>;
