using MacroShare.Application.Common.Interfaces;
using MacroShare.Application.Features.Ingredients.SearchIngredients;
using MacroShare.Domain.Entities;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Repositories;

public class IngredientRepository : IIngredientRepository
{
    private readonly MacroShareDbContext _db;

    public IngredientRepository(MacroShareDbContext db) => _db = db;

    public Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
        => _db.Ingredients.AnyAsync(i => i.Name.ToLower() == name.ToLower(), cancellationToken);

    public async Task AddAsync(Ingredient ingredient, CancellationToken cancellationToken = default)
        => await _db.Ingredients.AddAsync(ingredient, cancellationToken);

    public Task<List<Ingredient>> SearchAsync(
        string term,
        int take,
        IngredientMacroFilters? filters = null,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Ingredients.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(term))
        {
            var pattern = $"%{term.Trim()}%";
            query = query.Where(i => EF.Functions.ILike(i.Name, pattern));
        }

        if (filters is not null)
        {
            if (filters.MinCalories is not null)
                query = query.Where(i => i.CaloriesPer100g >= filters.MinCalories);
            if (filters.MaxCalories is not null)
                query = query.Where(i => i.CaloriesPer100g <= filters.MaxCalories);
            if (filters.MinProtein is not null)
                query = query.Where(i => i.ProteinPer100g >= filters.MinProtein);
            if (filters.MaxProtein is not null)
                query = query.Where(i => i.ProteinPer100g <= filters.MaxProtein);
            if (filters.MinCarbs is not null)
                query = query.Where(i => i.CarbsPer100g >= filters.MinCarbs);
            if (filters.MaxCarbs is not null)
                query = query.Where(i => i.CarbsPer100g <= filters.MaxCarbs);
            if (filters.MinFat is not null)
                query = query.Where(i => i.FatPer100g >= filters.MinFat);
            if (filters.MaxFat is not null)
                query = query.Where(i => i.FatPer100g <= filters.MaxFat);
            if (filters.MinSugar is not null)
                query = query.Where(i => i.SugarPer100g >= filters.MinSugar);
            if (filters.MaxSugar is not null)
                query = query.Where(i => i.SugarPer100g <= filters.MaxSugar);
        }

        return query
            .OrderByDescending(i => i.ProteinPer100g)
            .ThenBy(i => i.Name.Length)
            .ThenBy(i => i.Name)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<HashSet<int>> GetExistingIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default)
    {
        var distinct = ids.Distinct().ToList();
        var found = await _db.Ingredients
            .Where(i => distinct.Contains(i.Id))
            .Select(i => i.Id)
            .ToListAsync(cancellationToken);
        return found.ToHashSet();
    }
}
