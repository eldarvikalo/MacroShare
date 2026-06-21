namespace MacroShare.Domain.Entities;

/// <summary>Shared inventory for the whole household.</summary>
public class HouseholdPantry
{
    public int Id { get; set; }

    public int HouseholdId { get; set; }
    public Household? Household { get; set; }

    public ICollection<PantryItem> Items { get; set; } = new List<PantryItem>();
}
