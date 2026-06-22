namespace MacroShare.Api.Controllers;

public record UpsertPantryItemRequest(int IngredientId, decimal QuantityGrams);

public record UpdatePantryQuantityRequest(decimal QuantityGrams);
