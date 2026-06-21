using MediatR;

namespace MacroShare.Application.Features.Account.LogBodyComposition;

public record LogBodyCompositionCommand(
    DateTime MeasuredAt,
    decimal WeightKg,
    decimal? Bmi,
    decimal? BodyFatPercent,
    int? BodyScore,
    decimal? BodyWaterKg,
    decimal? BodyWaterPercent,
    decimal? FatMassKg,
    decimal? BoneMineralKg,
    decimal? BoneMineralPercent,
    decimal? ProteinMassKg,
    decimal? ProteinPercent,
    decimal? MuscleMassKg,
    decimal? MusclePercent,
    decimal? SkeletalMuscleKg,
    int? VisceralFatRating,
    decimal? Bmr,
    decimal? WaistHipRatio,
    int? BodyAge,
    decimal? FatFreeBodyWeightKg,
    int? HeartRateBpm,
    decimal? StandardWeightKg,
    decimal? WeightControlKg,
    decimal? FatControlKg,
    decimal? MuscleControlKg,
    string? BodyTypeLabel,
    string? Notes,
    bool ApplyToProfile = true,
    bool RecalculateTargets = false) : IRequest<BodyCompositionEntryDto>;

public record BodyCompositionEntryDto(
    int Id,
    DateTime MeasuredAt,
    decimal WeightKg,
    decimal? Bmi,
    decimal? BodyFatPercent,
    int? BodyScore,
    decimal? Bmr,
    decimal? MuscleMassKg,
    decimal? FatMassKg,
    decimal? StandardWeightKg,
    decimal? WeightControlKg,
    string? BodyTypeLabel,
    string? Notes);
