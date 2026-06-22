namespace MacroShare.Application.Features.Households.GetHouseholdPantry;

public record PantryItemDto(
    int Id,
    int IngredientId,
    string Name,
    decimal QuantityGrams);
