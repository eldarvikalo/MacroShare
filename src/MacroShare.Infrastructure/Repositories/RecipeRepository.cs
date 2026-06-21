using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MacroShare.Domain.Enums;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Repositories;

public class RecipeRepository : IRecipeRepository
{
    private readonly MacroShareDbContext _db;

    public RecipeRepository(MacroShareDbContext db) => _db = db;

    public Task<Recipe?> GetWithIngredientsAsync(int recipeId, CancellationToken cancellationToken = default)
        => _db.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .FirstOrDefaultAsync(r => r.Id == recipeId, cancellationToken);

    public Task<List<Recipe>> GetByMealTypeWithIngredientsAsync(MealType mealType, CancellationToken cancellationToken = default)
        => _db.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .Where(r => r.MealType == mealType)
            .ToListAsync(cancellationToken);

    public Task<List<Recipe>> GetAllAsync(CancellationToken cancellationToken = default)
        => _db.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Recipe recipe, CancellationToken cancellationToken = default)
        => await _db.Recipes.AddAsync(recipe, cancellationToken);

    public void Remove(Recipe recipe) => _db.Recipes.Remove(recipe);
}
