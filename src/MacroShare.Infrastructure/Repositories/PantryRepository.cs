using MacroShare.Application.Common.Interfaces;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Repositories;

public class PantryRepository : IPantryRepository
{
    private readonly MacroShareDbContext _db;

    public PantryRepository(MacroShareDbContext db) => _db = db;

    public async Task<HashSet<int>> GetIngredientIdsAsync(int householdId, CancellationToken cancellationToken = default)
    {
        var ids = await _db.PantryItems
            .Where(pi => pi.Pantry!.HouseholdId == householdId)
            .Select(pi => pi.IngredientId)
            .ToListAsync(cancellationToken);

        return ids.ToHashSet();
    }

    public async Task<IReadOnlyList<Application.Features.Households.GetHouseholdPantry.PantryItemDto>> GetItemsAsync(
        int householdId,
        CancellationToken cancellationToken = default)
    {
        return await _db.PantryItems
            .Where(pi => pi.Pantry!.HouseholdId == householdId)
            .OrderBy(pi => pi.Ingredient!.Name)
            .Select(pi => new Application.Features.Households.GetHouseholdPantry.PantryItemDto(
                pi.Id,
                pi.IngredientId,
                pi.Ingredient!.Name,
                pi.QuantityGrams))
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetPantryIdForHouseholdAsync(int householdId, CancellationToken cancellationToken = default)
    {
        var pantryId = await _db.HouseholdPantries
            .Where(p => p.HouseholdId == householdId)
            .Select(p => p.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (pantryId == 0)
            throw new InvalidOperationException($"No pantry found for household {householdId}.");

        return pantryId;
    }

    public Task<Domain.Entities.PantryItem?> FindItemAsync(
        int householdId,
        int ingredientId,
        CancellationToken cancellationToken = default)
        => _db.PantryItems
            .FirstOrDefaultAsync(
                pi => pi.Pantry!.HouseholdId == householdId && pi.IngredientId == ingredientId,
                cancellationToken);

    public async Task<Application.Features.Households.GetHouseholdPantry.PantryItemDto?> GetItemDtoAsync(
        int householdId,
        int ingredientId,
        CancellationToken cancellationToken = default)
        => await _db.PantryItems
            .Where(pi => pi.Pantry!.HouseholdId == householdId && pi.IngredientId == ingredientId)
            .Select(pi => new Application.Features.Households.GetHouseholdPantry.PantryItemDto(
                pi.Id,
                pi.IngredientId,
                pi.Ingredient!.Name,
                pi.QuantityGrams))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task AddItemAsync(Domain.Entities.PantryItem item, CancellationToken cancellationToken = default)
        => await _db.PantryItems.AddAsync(item, cancellationToken);

    public Task RemoveItemAsync(Domain.Entities.PantryItem item, CancellationToken cancellationToken = default)
    {
        _db.PantryItems.Remove(item);
        return Task.CompletedTask;
    }
}
