namespace MacroShare.Domain.Entities;

/// <summary>
/// Aggregate root. A household groups N users who share a pantry and cook common meals.
/// The schema is intentionally one-to-many so a 3rd, 4th, or Nth member can be added later.
/// </summary>
public class Household
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<AppUser> Members { get; set; } = new List<AppUser>();
    public HouseholdPantry? Pantry { get; set; }
    public ICollection<MealLog> MealLogs { get; set; } = new List<MealLog>();
}
