using MacroShare.Domain.Enums;

namespace MacroShare.Domain.Entities;

public class AppUser
{
    public int Id { get; set; }

    // One Household has many AppUsers (1-to-many). Never hardcoded to two.
    public int HouseholdId { get; set; }
    public Household? Household { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Sex Sex { get; set; }

    public int? Age { get; set; }

    public decimal HeightCm { get; set; }
    public decimal WeightKg { get; set; }

    public decimal Bmr { get; set; }
    public decimal ActivityMultiplier { get; set; }

    /// <summary>Total Daily Energy Expenditure. Computed, not persisted.</summary>
    public decimal Tdee => Math.Round(Bmr * ActivityMultiplier, 2);

    public decimal TargetCalories { get; set; }
    public decimal TargetProtein { get; set; }

    /// <summary>Hex color used by the frontend avatar; purely cosmetic.</summary>
    public string? AvatarColor { get; set; }

    public ICollection<BodyCompositionEntry> BodyCompositionEntries { get; set; } = new List<BodyCompositionEntry>();
}
