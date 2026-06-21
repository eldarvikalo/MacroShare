using MediatR;

namespace MacroShare.Application.Features.Account.GetDailyProgress;

public record GetDailyProgressQuery(DateOnly? Date = null) : IRequest<List<DailyProgressDto>>;

public record DailyProgressDto(
    int UserId,
    string Name,
    string? AvatarColor,
    decimal TargetCalories,
    decimal TargetProtein,
    decimal ConsumedCalories,
    decimal ConsumedProtein,
    decimal ConsumedCarbs,
    decimal ConsumedFat,
    decimal RemainingCalories,
    decimal RemainingProtein);
