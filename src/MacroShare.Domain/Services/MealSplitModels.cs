namespace MacroShare.Domain.Services;

/// <summary>Aggregated macros for the entire cooked recipe.</summary>
public record RecipeMacros(
    decimal TotalGrams,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal Sugar);

/// <summary>One participant's computed share of the meal.</summary>
public record PersonPortion(
    int UserId,
    string Name,
    decimal RatioPercent,
    decimal PortionGrams,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal Sugar);

/// <summary>
/// Result of splitting a recipe across N participants. The portions always sum
/// to 100% of the cooked meal regardless of how many people are eating.
/// </summary>
public record MealSplitResult(
    RecipeMacros TotalMeal,
    IReadOnlyList<PersonPortion> Portions);
