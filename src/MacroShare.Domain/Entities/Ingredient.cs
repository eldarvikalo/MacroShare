namespace MacroShare.Domain.Entities;

public class Ingredient
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public decimal CaloriesPer100g { get; set; }
    public decimal ProteinPer100g { get; set; }
    public decimal CarbsPer100g { get; set; }
    public decimal FatPer100g { get; set; }
    public decimal SugarPer100g { get; set; }

    /// <summary>True when added by a user via the custom-ingredient endpoint.</summary>
    public bool IsCustom { get; set; }
}
