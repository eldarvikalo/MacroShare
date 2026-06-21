using MacroShare.Application.Features.Ingredients.SearchIngredients;
using MacroShare.Domain.Entities;

namespace MacroShare.Application.Common.Interfaces;

public interface IIngredientRepository
{
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);

    Task AddAsync(Ingredient ingredient, CancellationToken cancellationToken = default);

    Task<List<Ingredient>> SearchAsync(
        string term,
        int take,
        IngredientMacroFilters? filters = null,
        CancellationToken cancellationToken = default);

    Task<HashSet<int>> GetExistingIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default);
}
