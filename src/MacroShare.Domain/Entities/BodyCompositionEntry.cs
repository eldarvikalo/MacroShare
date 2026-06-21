namespace MacroShare.Domain.Entities;

/// <summary>
/// A single smart-scale body composition reading for progress tracking over time.
/// </summary>
public class BodyCompositionEntry
{
    public int Id { get; set; }
    public int AppUserId { get; set; }
    public AppUser? AppUser { get; set; }

    public DateTime MeasuredAt { get; set; }

    public decimal WeightKg { get; set; }
    public decimal? Bmi { get; set; }
    public decimal? BodyFatPercent { get; set; }
    public int? BodyScore { get; set; }

    public decimal? BodyWaterKg { get; set; }
    public decimal? BodyWaterPercent { get; set; }
    public decimal? FatMassKg { get; set; }
    public decimal? BoneMineralKg { get; set; }
    public decimal? BoneMineralPercent { get; set; }
    public decimal? ProteinMassKg { get; set; }
    public decimal? ProteinPercent { get; set; }
    public decimal? MuscleMassKg { get; set; }
    public decimal? MusclePercent { get; set; }
    public decimal? SkeletalMuscleKg { get; set; }

    public int? VisceralFatRating { get; set; }
    public decimal? Bmr { get; set; }
    public decimal? WaistHipRatio { get; set; }
    public int? BodyAge { get; set; }
    public decimal? FatFreeBodyWeightKg { get; set; }
    public int? HeartRateBpm { get; set; }

    public decimal? StandardWeightKg { get; set; }
    public decimal? WeightControlKg { get; set; }
    public decimal? FatControlKg { get; set; }
    public decimal? MuscleControlKg { get; set; }

    public string? BodyTypeLabel { get; set; }
    public string? Notes { get; set; }
}
