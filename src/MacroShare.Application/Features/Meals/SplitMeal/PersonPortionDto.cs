namespace MacroShare.Application.Features.Meals.SplitMeal;

public record PersonPortionDto(
    int UserId,
    string Name,
    string? AvatarColor,
    decimal RatioPercent,
    decimal PortionGrams,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal Sugar);
