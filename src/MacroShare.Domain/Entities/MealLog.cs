using MacroShare.Domain.Enums;

namespace MacroShare.Domain.Entities;

public class MealLog
{
    public int Id { get; set; }

    public int HouseholdId { get; set; }
    public Household? Household { get; set; }

    public DateOnly Date { get; set; }
    public MealType MealType { get; set; }

    public int? RecipeId { get; set; }
    public Recipe? Recipe { get; set; }

    public ICollection<MealLogEntry> Entries { get; set; } = new List<MealLogEntry>();
}
