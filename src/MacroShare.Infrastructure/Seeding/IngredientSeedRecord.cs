namespace MacroShare.Infrastructure.Seeding;

/// <summary>Shape of a single record in data/ingredients.json.</summary>
public class IngredientSeedRecord
{
    public string Name { get; set; } = string.Empty;
    public decimal CaloriesPer100g { get; set; }
    public decimal ProteinPer100g { get; set; }
    public decimal CarbsPer100g { get; set; }
    public decimal FatPer100g { get; set; }
    public decimal SugarPer100g { get; set; }
}
