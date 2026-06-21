using MediatR;

namespace MacroShare.Application.Features.Account.UpdateProfile;

public record UpdateProfileCommand(
    decimal? TargetCalories,
    decimal? TargetProtein,
    decimal? ActivityMultiplier,
    decimal? HeightCm) : IRequest<CurrentProfileDto>;

public record CurrentProfileDto(
    int Id,
    string Name,
    decimal WeightKg,
    decimal HeightCm,
    decimal Bmr,
    decimal Tdee,
    decimal TargetCalories,
    decimal TargetProtein,
    decimal ActivityMultiplier);
