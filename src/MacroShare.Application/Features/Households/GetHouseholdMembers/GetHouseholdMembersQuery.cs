using MediatR;

namespace MacroShare.Application.Features.Households.GetHouseholdMembers;

public record GetHouseholdMembersQuery(int HouseholdId) : IRequest<List<HouseholdMemberDto>>;
