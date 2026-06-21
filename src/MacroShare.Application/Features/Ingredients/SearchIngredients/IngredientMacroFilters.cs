namespace MacroShare.Application.Features.Ingredients.SearchIngredients;

/// <summary>Optional per-100g macro bounds applied to ingredient search results.</summary>
public record IngredientMacroFilters(
    decimal? MinCalories = null,
    decimal? MaxCalories = null,
    decimal? MinProtein = null,
    decimal? MaxProtein = null,
    decimal? MinCarbs = null,
    decimal? MaxCarbs = null,
    decimal? MinFat = null,
    decimal? MaxFat = null,
    decimal? MinSugar = null,
    decimal? MaxSugar = null)
{
    public bool HasAny =>
        MinCalories is not null || MaxCalories is not null ||
        MinProtein is not null || MaxProtein is not null ||
        MinCarbs is not null || MaxCarbs is not null ||
        MinFat is not null || MaxFat is not null ||
        MinSugar is not null || MaxSugar is not null;
}
