using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Account.GetBodyCompositionHistory;

public class GetBodyCompositionHistoryQueryHandler
    : IRequestHandler<GetBodyCompositionHistoryQuery, List<BodyCompositionHistoryDto>>
{
    private readonly ICurrentUser _currentUser;
    private readonly IHouseholdRepository _households;
    private readonly IBodyCompositionRepository _bodyComposition;

    public GetBodyCompositionHistoryQueryHandler(
        ICurrentUser currentUser,
        IHouseholdRepository households,
        IBodyCompositionRepository bodyComposition)
    {
        _currentUser = currentUser;
        _households = households;
        _bodyComposition = bodyComposition;
    }

    public async Task<List<BodyCompositionHistoryDto>> Handle(
        GetBodyCompositionHistoryQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.HouseholdId is null)
            throw new UnauthorizedException("Not authenticated.");

        var members = await _households.GetMembersAsync(_currentUser.HouseholdId.Value, cancellationToken);
        var targetUserId = request.UserId ?? _currentUser.UserId
            ?? throw new UnauthorizedException("Not authenticated.");

        if (!members.Any(m => m.Id == targetUserId))
            throw new ForbiddenException("You can only view metrics for members of your household.");

        var member = members.First(m => m.Id == targetUserId);
        var take = Math.Clamp(request.Take, 1, 100);
        var entries = await _bodyComposition.GetHistoryAsync(targetUserId, take, cancellationToken);

        return entries.Select(e => new BodyCompositionHistoryDto(
            e.Id,
            e.AppUserId,
            member.Name,
            e.MeasuredAt,
            e.WeightKg,
            e.Bmi,
            e.BodyFatPercent,
            e.BodyScore,
            e.Bmr,
            e.MuscleMassKg,
            e.FatMassKg,
            e.BodyWaterPercent,
            e.VisceralFatRating,
            e.StandardWeightKg,
            e.WeightControlKg,
            e.FatControlKg,
            e.BodyTypeLabel,
            e.Notes)).ToList();
    }
}
