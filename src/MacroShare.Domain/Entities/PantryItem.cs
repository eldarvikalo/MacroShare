namespace MacroShare.Domain.Entities;

public class PantryItem
{
    public int Id { get; set; }

    public int PantryId { get; set; }
    public HouseholdPantry? Pantry { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    public decimal QuantityGrams { get; set; }
}
