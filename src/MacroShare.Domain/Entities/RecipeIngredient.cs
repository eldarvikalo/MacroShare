namespace MacroShare.Domain.Entities;

public class RecipeIngredient
{
    public int Id { get; set; }

    public int RecipeId { get; set; }
    public Recipe? Recipe { get; set; }

    public int IngredientId { get; set; }
    public Ingredient? Ingredient { get; set; }

    /// <summary>Raw grams of this ingredient used in the full recipe.</summary>
    public decimal QuantityGrams { get; set; }
}
