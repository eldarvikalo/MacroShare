using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;

namespace MacroShare.Api.Extensions;

public static class HouseholdAuthorization
{
    public static int RequireHouseholdId(this ICurrentUser currentUser)
    {
        if (!currentUser.IsAuthenticated || currentUser.HouseholdId is null)
            throw new UnauthorizedException("Not authenticated.");

        return currentUser.HouseholdId.Value;
    }

    public static void EnsureHouseholdAccess(this ICurrentUser currentUser, int householdId)
    {
        var own = currentUser.RequireHouseholdId();
        if (own != householdId)
            throw new ForbiddenException("You do not have access to this household.");
    }
}
