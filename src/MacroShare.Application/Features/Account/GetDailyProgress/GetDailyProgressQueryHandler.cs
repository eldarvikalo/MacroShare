using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Account.GetDailyProgress;

public class GetDailyProgressQueryHandler : IRequestHandler<GetDailyProgressQuery, List<DailyProgressDto>>
{
    private readonly ICurrentUser _currentUser;
    private readonly IHouseholdRepository _households;
    private readonly IMealLogRepository _mealLogs;

    public GetDailyProgressQueryHandler(
        ICurrentUser currentUser,
        IHouseholdRepository households,
        IMealLogRepository mealLogs)
    {
        _currentUser = currentUser;
        _households = households;
        _mealLogs = mealLogs;
    }

    public async Task<List<DailyProgressDto>> Handle(
        GetDailyProgressQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.HouseholdId is null)
            throw new UnauthorizedException("Not authenticated.");

        var date = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var members = await _households.GetMembersAsync(_currentUser.HouseholdId.Value, cancellationToken);
        var consumed = await _mealLogs.GetConsumedMacrosAsync(
            _currentUser.HouseholdId.Value,
            date,
            cancellationToken);

        return members.Select(m =>
        {
            consumed.TryGetValue(m.Id, out var macros);
            macros ??= new ConsumedMacros(0, 0, 0, 0, 0);

            return new DailyProgressDto(
                m.Id,
                m.Name,
                m.AvatarColor,
                m.TargetCalories,
                m.TargetProtein,
                macros.Calories,
                macros.Protein,
                macros.Carbs,
                macros.Fat,
                Math.Max(0, m.TargetCalories - macros.Calories),
                Math.Max(0, m.TargetProtein - macros.Protein));
        }).ToList();
    }
}
