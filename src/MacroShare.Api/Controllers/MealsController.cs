using MacroShare.Application.Features.Meals.LogMeal;
using MacroShare.Application.Features.Meals.SplitMeal;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MacroShare.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/meals")]
public class MealsController : ControllerBase
{
    private readonly ISender _sender;

    public MealsController(ISender sender) => _sender = sender;

    /// <summary>Splits a recipe across the selected household members (1..N).</summary>
    [HttpPost("split")]
    [ProducesResponseType(typeof(MealSplitResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MealSplitResultDto>> Split(
        [FromBody] SplitMealCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Persists a cooked meal split to the daily log.</summary>
    [HttpPost("log")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Log(
        [FromBody] LogMealCommand command,
        CancellationToken cancellationToken)
    {
        await _sender.Send(command, cancellationToken);
        return NoContent();
    }
}
