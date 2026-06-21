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
}
