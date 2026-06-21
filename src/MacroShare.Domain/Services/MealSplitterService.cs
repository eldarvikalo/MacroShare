using MacroShare.Domain.Entities;

namespace MacroShare.Domain.Services;

/// <summary>
/// Pure domain logic (no DB) that divides a single cooked recipe among N participants.
///
/// Algorithm:
///   1. Aggregate the recipe's total grams + macros from its raw ingredients.
///   2. For each participant compute a "demand" = remaining calories today
///      (TargetCalories - consumedToday), floored at a minimum so nobody gets a zero
///      or negative share.
///   3. Each person's ratio = demand_i / sum(demand). Ratios always sum to 1.0.
///   4. Scale grams and every macro by that ratio.
/// </summary>
public class MealSplitterService : IMealSplitterService
{
    // Floor so a participant who already hit their target still gets a small plate
    // instead of 0g, and we never divide by zero.
    private const decimal MinDemandFloor = 1m;

    public MealSplitResult Split(
        Recipe recipe,
        IReadOnlyList<AppUser> participants,
        IReadOnlyDictionary<int, decimal>? consumedCaloriesByUserId = null)
    {
        ArgumentNullException.ThrowIfNull(recipe);

        if (participants is null || participants.Count == 0)
            throw new ArgumentException("At least one participant is required.", nameof(participants));

        var totals = Aggregate(recipe);

        var demands = participants.ToDictionary(
            user => user.Id,
            user =>
            {
                var consumed = consumedCaloriesByUserId is not null
                    && consumedCaloriesByUserId.TryGetValue(user.Id, out var c)
                        ? c
                        : 0m;

                var remaining = user.TargetCalories - consumed;
                return Math.Max(remaining, MinDemandFloor);
            });

        var totalDemand = demands.Values.Sum();

        var portions = new List<PersonPortion>(participants.Count);
        foreach (var user in participants)
        {
            var ratio = demands[user.Id] / totalDemand;

            portions.Add(new PersonPortion(
                UserId: user.Id,
                Name: user.Name,
                RatioPercent: Math.Round(ratio * 100m, 1),
                PortionGrams: Math.Round(totals.TotalGrams * ratio, 1),
                Calories: Math.Round(totals.Calories * ratio, 1),
                Protein: Math.Round(totals.Protein * ratio, 1),
                Carbs: Math.Round(totals.Carbs * ratio, 1),
                Fat: Math.Round(totals.Fat * ratio, 1),
                Sugar: Math.Round(totals.Sugar * ratio, 1)));
        }

        return new MealSplitResult(totals, portions);
    }

    private static RecipeMacros Aggregate(Recipe recipe)
    {
        decimal grams = 0, calories = 0, protein = 0, carbs = 0, fat = 0, sugar = 0;

        foreach (var ri in recipe.Ingredients)
        {
            if (ri.Ingredient is null)
                continue;

            var factor = ri.QuantityGrams / 100m;
            grams += ri.QuantityGrams;
            calories += ri.Ingredient.CaloriesPer100g * factor;
            protein += ri.Ingredient.ProteinPer100g * factor;
            carbs += ri.Ingredient.CarbsPer100g * factor;
            fat += ri.Ingredient.FatPer100g * factor;
            sugar += ri.Ingredient.SugarPer100g * factor;
        }

        return new RecipeMacros(
            Math.Round(grams, 1),
            Math.Round(calories, 1),
            Math.Round(protein, 1),
            Math.Round(carbs, 1),
            Math.Round(fat, 1),
            Math.Round(sugar, 1));
    }
}
