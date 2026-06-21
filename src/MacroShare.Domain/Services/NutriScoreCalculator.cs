namespace MacroShare.Domain.Services;

/// <summary>
/// Computes a Nutri-Score-style A-E grade for a cooked recipe from its aggregated macros.
///
/// This follows the official Nutri-Score points model (energy, sugars, saturated fat as
/// negatives; protein as a positive) but is an APPROXIMATION: the Ingredient model does not
/// track saturated fat, sodium, fibre, or fruit/veg content, so total fat is used as a
/// saturated-fat proxy and sodium/fibre/fruit contributions are treated as zero. It is a
/// good relative "healthiness" indicator for ranking recipes, not an official label.
/// </summary>
public static class NutriScoreCalculator
{
    private static readonly decimal[] EnergyKjThresholds =
        { 335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350 };

    private static readonly decimal[] SugarThresholds =
        { 4.5m, 9, 13.5m, 18, 22.5m, 27, 31, 36, 40, 45 };

    private static readonly decimal[] SaturatedFatThresholds =
        { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

    private static readonly decimal[] ProteinThresholds =
        { 1.6m, 3.2m, 4.8m, 6.4m, 8.0m };

    public sealed record Result(string Grade, int Points);

    public static Result Evaluate(
        decimal totalGrams,
        decimal calories,
        decimal protein,
        decimal fat,
        decimal sugar)
    {
        if (totalGrams <= 0)
            return new Result("?", 0);

        var factor = 100m / totalGrams;
        var energyKjPer100g = calories * factor * 4.184m; // kcal -> kJ
        var sugarPer100g = sugar * factor;
        var fatPer100g = fat * factor;
        var proteinPer100g = protein * factor;

        var negative =
            CountAbove(energyKjPer100g, EnergyKjThresholds) +
            CountAbove(sugarPer100g, SugarThresholds) +
            CountAbove(fatPer100g, SaturatedFatThresholds);

        var proteinPoints = CountAbove(proteinPer100g, ProteinThresholds);

        // Official rule: protein is only subtracted when negative points < 11
        // (or fruit/veg points reach 5, which we cannot measure here).
        var positive = negative < 11 ? proteinPoints : 0;

        var score = negative - positive;

        return new Result(GradeFor(score), score);
    }

    private static int CountAbove(decimal value, decimal[] thresholds)
    {
        var points = 0;
        foreach (var t in thresholds)
        {
            if (value > t) points++;
            else break;
        }
        return points;
    }

    private static string GradeFor(int score) => score switch
    {
        <= -1 => "A",
        <= 2 => "B",
        <= 10 => "C",
        <= 18 => "D",
        _ => "E"
    };
}
