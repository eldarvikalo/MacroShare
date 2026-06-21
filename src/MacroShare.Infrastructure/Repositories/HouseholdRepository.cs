using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Repositories;

public class HouseholdRepository : IHouseholdRepository
{
    private readonly MacroShareDbContext _db;

    public HouseholdRepository(MacroShareDbContext db) => _db = db;

    public Task<Household?> GetWithMembersAsync(int householdId, CancellationToken cancellationToken = default)
        => _db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == householdId, cancellationToken);

    public Task<List<AppUser>> GetMembersAsync(int householdId, CancellationToken cancellationToken = default)
        => _db.AppUsers
            .Where(u => u.HouseholdId == householdId)
            .OrderBy(u => u.Id)
            .ToListAsync(cancellationToken);

    public Task<List<AppUser>> GetUsersByIdsAsync(IEnumerable<int> userIds, CancellationToken cancellationToken = default)
    {
        var ids = userIds.Distinct().ToList();
        return _db.AppUsers
            .Where(u => ids.Contains(u.Id))
            .ToListAsync(cancellationToken);
    }
}
