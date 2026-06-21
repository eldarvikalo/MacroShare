using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MediatR;

namespace MacroShare.Application.Features.Auth.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResultDto>
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenGenerator _tokenGenerator;

    public LoginCommandHandler(
        IUserRepository users,
        IPasswordHasher passwordHasher,
        ITokenGenerator tokenGenerator)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<LoginResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _users.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), cancellationToken)
            ?? throw new UnauthorizedException("Invalid email or password.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        var token = _tokenGenerator.GenerateToken(user);

        return new LoginResultDto(
            token,
            user.Id,
            user.HouseholdId,
            user.Name,
            user.Email,
            user.AvatarColor);
    }
}
