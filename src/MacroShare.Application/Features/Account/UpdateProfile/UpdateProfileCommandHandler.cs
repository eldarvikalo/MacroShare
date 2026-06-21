using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Account.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, CurrentProfileDto>
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProfileCommandHandler(
        ICurrentUser currentUser,
        IUserRepository users,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _users = users;
        _unitOfWork = unitOfWork;
    }

    public async Task<CurrentProfileDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedException("Not authenticated.");

        var user = await _users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken)
            ?? throw new NotFoundException("User", _currentUser.UserId.Value);

        if (request.TargetCalories is not null)
            user.TargetCalories = request.TargetCalories.Value;
        if (request.TargetProtein is not null)
            user.TargetProtein = request.TargetProtein.Value;
        if (request.ActivityMultiplier is not null)
            user.ActivityMultiplier = request.ActivityMultiplier.Value;
        if (request.HeightCm is not null)
            user.HeightCm = request.HeightCm.Value;

        await _users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CurrentProfileDto(
            user.Id,
            user.Name,
            user.WeightKg,
            user.HeightCm,
            user.Bmr,
            user.Tdee,
            user.TargetCalories,
            user.TargetProtein,
            user.ActivityMultiplier);
    }
}
