using MacroShare.Api.Extensions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Application.Features.Households.GetHouseholdMembers;
using MacroShare.Application.Features.Meals.GetMealSuggestions;
using MacroShare.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MacroShare.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/households")]
public class HouseholdsController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ICurrentUser _currentUser;

    public HouseholdsController(ISender sender, ICurrentUser currentUser)
    {
        _sender = sender;
        _currentUser = currentUser;
    }

    /// <summary>Returns all members of a household (scales to N users).</summary>
    [HttpGet("{householdId:int}/members")]
    public async Task<ActionResult<List<HouseholdMemberDto>>> GetMembers(
        int householdId,
        CancellationToken cancellationToken)
    {
        _currentUser.EnsureHouseholdAccess(householdId);
        var members = await _sender.Send(new GetHouseholdMembersQuery(householdId), cancellationToken);
        return Ok(members);
    }

    /// <summary>Returns up to 50 pantry-matched, protein-prioritized meal suggestions.</summary>
    [HttpGet("{householdId:int}/meal-suggestions")]
    public async Task<ActionResult<List<MealSuggestionDto>>> GetMealSuggestions(
        int householdId,
        [FromQuery] MealType type,
        CancellationToken cancellationToken)
    {
        _currentUser.EnsureHouseholdAccess(householdId);
        var suggestions = await _sender.Send(new GetMealSuggestionsQuery(householdId, type), cancellationToken);
        return Ok(suggestions);
    }
}
