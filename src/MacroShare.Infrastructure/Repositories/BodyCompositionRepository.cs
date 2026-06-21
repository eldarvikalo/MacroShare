using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Repositories;

public class BodyCompositionRepository : IBodyCompositionRepository
{
    private readonly MacroShareDbContext _db;

    public BodyCompositionRepository(MacroShareDbContext db) => _db = db;

    public async Task AddAsync(BodyCompositionEntry entry, CancellationToken cancellationToken = default)
        => await _db.BodyCompositionEntries.AddAsync(entry, cancellationToken);

    public Task<List<BodyCompositionEntry>> GetHistoryAsync(int userId, int take, CancellationToken cancellationToken = default)
        => _db.BodyCompositionEntries
            .AsNoTracking()
            .Where(e => e.AppUserId == userId)
            .OrderByDescending(e => e.MeasuredAt)
            .Take(take)
            .ToListAsync(cancellationToken);

    public Task<BodyCompositionEntry?> GetLatestAsync(int userId, CancellationToken cancellationToken = default)
        => _db.BodyCompositionEntries
            .AsNoTracking()
            .Where(e => e.AppUserId == userId)
            .OrderByDescending(e => e.MeasuredAt)
            .FirstOrDefaultAsync(cancellationToken);
}
