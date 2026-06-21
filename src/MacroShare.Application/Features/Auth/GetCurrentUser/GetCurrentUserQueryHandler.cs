using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Auth.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, CurrentUserDto>
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserRepository _users;
    private readonly IBodyCompositionRepository _bodyComposition;

    public GetCurrentUserQueryHandler(
        ICurrentUser currentUser,
        IUserRepository users,
        IBodyCompositionRepository bodyComposition)
    {
        _currentUser = currentUser;
        _users = users;
        _bodyComposition = bodyComposition;
    }

    public async Task<CurrentUserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedException("Not authenticated.");

        var user = await _users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken)
            ?? throw new NotFoundException("User", _currentUser.UserId.Value);

        var latest = await _bodyComposition.GetLatestAsync(user.Id, cancellationToken);

        return new CurrentUserDto(
            user.Id,
            user.HouseholdId,
            user.Name,
            user.Email,
            user.Sex,
            user.Age,
            user.HeightCm,
            user.WeightKg,
            user.Bmr,
            user.Tdee,
            user.TargetCalories,
            user.TargetProtein,
            user.AvatarColor,
            latest?.WeightKg,
            latest?.BodyFatPercent,
            latest?.MeasuredAt);
    }
}
