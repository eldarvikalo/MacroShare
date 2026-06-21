using MediatR;

namespace MacroShare.Application.Features.Account.GetBodyCompositionHistory;

public record GetBodyCompositionHistoryQuery(int? UserId = null, int Take = 30)
    : IRequest<List<BodyCompositionHistoryDto>>;

public record BodyCompositionHistoryDto(
    int Id,
    int UserId,
    string UserName,
    DateTime MeasuredAt,
    decimal WeightKg,
    decimal? Bmi,
    decimal? BodyFatPercent,
    int? BodyScore,
    decimal? Bmr,
    decimal? MuscleMassKg,
    decimal? FatMassKg,
    decimal? BodyWaterPercent,
    int? VisceralFatRating,
    decimal? StandardWeightKg,
    decimal? WeightControlKg,
    decimal? FatControlKg,
    string? BodyTypeLabel,
    string? Notes);
