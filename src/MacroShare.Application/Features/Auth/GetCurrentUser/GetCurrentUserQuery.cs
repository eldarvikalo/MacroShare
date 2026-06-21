using MacroShare.Domain.Enums;
using MediatR;

namespace MacroShare.Application.Features.Auth.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<CurrentUserDto>;

public record CurrentUserDto(
    int Id,
    int HouseholdId,
    string Name,
    string Email,
    Sex Sex,
    int? Age,
    decimal HeightCm,
    decimal WeightKg,
    decimal Bmr,
    decimal Tdee,
    decimal TargetCalories,
    decimal TargetProtein,
    string? AvatarColor,
    decimal? LatestWeightKg,
    decimal? LatestBodyFatPercent,
    DateTime? LatestMeasuredAt);
