using MacroShare.Domain.Entities;
using MacroShare.Domain.Enums;

namespace MacroShare.Application.Common.Interfaces;

public interface IRecipeRepository
{
    Task<Recipe?> GetWithIngredientsAsync(int recipeId, CancellationToken cancellationToken = default);

    Task<List<Recipe>> GetByMealTypeWithIngredientsAsync(MealType mealType, CancellationToken cancellationToken = default);

    Task<List<Recipe>> GetAllAsync(CancellationToken cancellationToken = default);

    Task AddAsync(Recipe recipe, CancellationToken cancellationToken = default);

    void Remove(Recipe recipe);
}
