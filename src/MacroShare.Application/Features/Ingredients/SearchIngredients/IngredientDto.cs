namespace MacroShare.Application.Features.Ingredients.SearchIngredients;

public record IngredientDto(
    int Id,
    string Name,
    decimal CaloriesPer100g,
    decimal ProteinPer100g,
    decimal CarbsPer100g,
    decimal FatPer100g,
    decimal SugarPer100g,
    bool IsCustom);
