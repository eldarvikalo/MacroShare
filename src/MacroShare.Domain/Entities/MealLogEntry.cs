namespace MacroShare.Domain.Entities;

/// <summary>One person's actual consumed portion for a logged meal.</summary>
public class MealLogEntry
{
    public int Id { get; set; }

    public int MealLogId { get; set; }
    public MealLog? MealLog { get; set; }

    public int AppUserId { get; set; }
    public AppUser? AppUser { get; set; }

    public decimal PortionGrams { get; set; }
    public decimal Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fat { get; set; }
    public decimal Sugar { get; set; }
}
