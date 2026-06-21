namespace MacroShare.Application.Common.Interfaces;

public interface ICurrentUser
{
    int? UserId { get; }
    int? HouseholdId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}
