using MediatR;

namespace MacroShare.Application.Features.Auth.Login;

public record LoginCommand(string Email, string Password) : IRequest<LoginResultDto>;

public record LoginResultDto(
    string Token,
    int UserId,
    int HouseholdId,
    string Name,
    string Email,
    string? AvatarColor);
