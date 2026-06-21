using System.Security.Claims;
using MacroShare.Application.Common.Interfaces;

namespace MacroShare.Api.Services;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public int? UserId => int.TryParse(User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User?.FindFirstValue(ClaimTypes.Name)
        ?? User?.FindFirstValue("sub"), out var id) ? id : null;

    public int? HouseholdId => int.TryParse(User?.FindFirstValue("household_id"), out var id) ? id : null;

    public string? Email => User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue("email");
}
