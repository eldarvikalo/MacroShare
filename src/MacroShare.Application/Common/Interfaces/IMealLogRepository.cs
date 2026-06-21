using MacroShare.Domain.Entities;

namespace MacroShare.Application.Common.Interfaces;

public record ConsumedMacros(decimal Calories, decimal Protein, decimal Carbs, decimal Fat, decimal Sugar);

public interface IMealLogRepository
{
    Task<Dictionary<int, decimal>> GetConsumedCaloriesAsync(
        int householdId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<Dictionary<int, ConsumedMacros>> GetConsumedMacrosAsync(
        int householdId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task AddAsync(MealLog mealLog, CancellationToken cancellationToken = default);
}
