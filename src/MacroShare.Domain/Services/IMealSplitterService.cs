using MacroShare.Domain.Entities;

namespace MacroShare.Domain.Services;

public interface IMealSplitterService
{
    /// <summary>
    /// Splits a cooked recipe across an arbitrary number of participants based on each
    /// person's remaining daily calorie need.
    /// </summary>
    /// <param name="recipe">Recipe with its raw ingredients loaded.</param>
    /// <param name="participants">The household members eating this specific meal (1..N).</param>
    /// <param name="consumedCaloriesByUserId">
    /// Optional map of calories already consumed today per user. When omitted, each user's
    /// full <see cref="AppUser.TargetCalories"/> is used as their demand.
    /// </param>
    MealSplitResult Split(
        Recipe recipe,
        IReadOnlyList<AppUser> participants,
        IReadOnlyDictionary<int, decimal>? consumedCaloriesByUserId = null);
}
