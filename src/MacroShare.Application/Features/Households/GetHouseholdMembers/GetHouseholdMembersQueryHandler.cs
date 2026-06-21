using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Households.GetHouseholdMembers;

public class GetHouseholdMembersQueryHandler
    : IRequestHandler<GetHouseholdMembersQuery, List<HouseholdMemberDto>>
{
    private readonly IHouseholdRepository _households;

    public GetHouseholdMembersQueryHandler(IHouseholdRepository households)
        => _households = households;

    public async Task<List<HouseholdMemberDto>> Handle(
        GetHouseholdMembersQuery request,
        CancellationToken cancellationToken)
    {
        var members = await _households.GetMembersAsync(request.HouseholdId, cancellationToken);

        return members
            .Select(u => new HouseholdMemberDto(
                u.Id,
                u.Name,
                u.Sex,
                u.HeightCm,
                u.WeightKg,
                u.Bmr,
                u.Tdee,
                u.TargetCalories,
                u.TargetProtein,
                u.AvatarColor))
            .ToList();
    }
}
