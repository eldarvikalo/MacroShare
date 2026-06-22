using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Meals.GetTodaysMeals;

public class GetTodaysMealsQueryHandler
    : IRequestHandler<GetTodaysMealsQuery, List<TodaysMealDto>>
{
    private readonly IMealLogRepository _mealLogs;

    public GetTodaysMealsQueryHandler(IMealLogRepository mealLogs) => _mealLogs = mealLogs;

    public async Task<List<TodaysMealDto>> Handle(
        GetTodaysMealsQuery request,
        CancellationToken cancellationToken)
    {
        var date = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var logs = await _mealLogs.GetLogsForDateAsync(request.HouseholdId, date, cancellationToken);

        return logs
            .Select(log => new TodaysMealDto(
                log.Id,
                log.MealType,
                log.Recipe?.Name ?? "Logged meal",
                log.Date.ToDateTime(TimeOnly.MinValue),
                log.Entries
                    .Select(e => new TodaysMealPortionDto(
                        e.AppUserId,
                        e.AppUser?.Name ?? "Member",
                        e.AppUser?.AvatarColor,
                        e.PortionGrams,
                        e.Calories,
                        e.Protein))
                    .ToList()))
            .ToList();
    }
}
