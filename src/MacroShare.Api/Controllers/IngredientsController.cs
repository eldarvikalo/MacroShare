using MacroShare.Application.Features.Ingredients.AddCustomIngredient;
using MacroShare.Application.Features.Ingredients.SearchIngredients;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MacroShare.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/ingredients")]
public class IngredientsController : ControllerBase
{
    private readonly ISender _sender;

    public IngredientsController(ISender sender) => _sender = sender;

    /// <summary>Searches ingredients by name (case-insensitive contains). Used by the recipe builder.</summary>
    [HttpGet]
    public async Task<ActionResult<List<IngredientDto>>> Search(
        [FromQuery] string? search,
        [FromQuery] int take = 25,
        [FromQuery] decimal? minCalories = null,
        [FromQuery] decimal? maxCalories = null,
        [FromQuery] decimal? minProtein = null,
        [FromQuery] decimal? maxProtein = null,
        [FromQuery] decimal? minCarbs = null,
        [FromQuery] decimal? maxCarbs = null,
        [FromQuery] decimal? minFat = null,
        [FromQuery] decimal? maxFat = null,
        [FromQuery] decimal? minSugar = null,
        [FromQuery] decimal? maxSugar = null,
        CancellationToken cancellationToken = default)
    {
        var filters = new IngredientMacroFilters(
            minCalories, maxCalories,
            minProtein, maxProtein,
            minCarbs, maxCarbs,
            minFat, maxFat,
            minSugar, maxSugar);

        var results = await _sender.Send(
            new SearchIngredientsQuery(search, take, filters.HasAny ? filters : null),
            cancellationToken);
        return Ok(results);
    }

    /// <summary>Adds a custom/local ingredient not present in the seeded database.</summary>
    [HttpPost("custom")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddCustom(
        [FromBody] AddCustomIngredientCommand command,
        CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(AddCustom), new { id }, new { id });
    }
}
