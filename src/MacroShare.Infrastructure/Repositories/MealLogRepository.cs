using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Repositories;

public class MealLogRepository : IMealLogRepository
{
    private readonly MacroShareDbContext _db;

    public MealLogRepository(MacroShareDbContext db) => _db = db;

    public async Task<Dictionary<int, decimal>> GetConsumedCaloriesAsync(
        int householdId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var rows = await _db.MealLogEntries
            .Where(e => e.MealLog!.HouseholdId == householdId && e.MealLog.Date == date)
            .GroupBy(e => e.AppUserId)
            .Select(g => new { UserId = g.Key, Calories = g.Sum(x => x.Calories) })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(r => r.UserId, r => r.Calories);
    }

    public async Task<Dictionary<int, ConsumedMacros>> GetConsumedMacrosAsync(
        int householdId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var rows = await _db.MealLogEntries
            .Where(e => e.MealLog!.HouseholdId == householdId && e.MealLog.Date == date)
            .GroupBy(e => e.AppUserId)
            .Select(g => new
            {
                UserId = g.Key,
                Calories = g.Sum(x => x.Calories),
                Protein = g.Sum(x => x.Protein),
                Carbs = g.Sum(x => x.Carbs),
                Fat = g.Sum(x => x.Fat),
                Sugar = g.Sum(x => x.Sugar)
            })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(
            r => r.UserId,
            r => new ConsumedMacros(r.Calories, r.Protein, r.Carbs, r.Fat, r.Sugar));
    }

    public async Task AddAsync(MealLog mealLog, CancellationToken cancellationToken = default)
        => await _db.MealLogs.AddAsync(mealLog, cancellationToken);
}
