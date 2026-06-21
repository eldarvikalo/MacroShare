using MacroShare.Application.Features.Account.GetBodyCompositionHistory;
using MacroShare.Application.Features.Account.GetDailyProgress;
using MacroShare.Application.Features.Account.LogBodyComposition;
using MacroShare.Application.Features.Account.UpdateProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MacroShare.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly ISender _sender;

    public AccountController(ISender sender) => _sender = sender;

    [HttpGet("body-composition")]
    public async Task<ActionResult<List<BodyCompositionHistoryDto>>> GetBodyComposition(
        [FromQuery] int? userId,
        [FromQuery] int take = 30,
        CancellationToken cancellationToken = default)
    {
        var history = await _sender.Send(new GetBodyCompositionHistoryQuery(userId, take), cancellationToken);
        return Ok(history);
    }

    [HttpPost("body-composition")]
    public async Task<ActionResult<BodyCompositionEntryDto>> LogBodyComposition(
        [FromBody] LogBodyCompositionCommand command,
        CancellationToken cancellationToken)
    {
        var entry = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetBodyComposition), new { userId = (int?)null }, entry);
    }

    [HttpPatch("profile")]
    public async Task<ActionResult<CurrentProfileDto>> UpdateProfile(
        [FromBody] UpdateProfileCommand command,
        CancellationToken cancellationToken)
    {
        var profile = await _sender.Send(command, cancellationToken);
        return Ok(profile);
    }

    [HttpGet("daily-progress")]
    public async Task<ActionResult<List<DailyProgressDto>>> GetDailyProgress(
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken = default)
    {
        var progress = await _sender.Send(new GetDailyProgressQuery(date), cancellationToken);
        return Ok(progress);
    }
}
