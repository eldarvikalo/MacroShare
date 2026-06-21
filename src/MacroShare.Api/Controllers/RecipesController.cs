using MacroShare.Application.Features.Recipes.CreateRecipe;
using MacroShare.Application.Features.Recipes.DeleteRecipe;
using MacroShare.Application.Features.Recipes.GetRecipes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MacroShare.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/recipes")]
public class RecipesController : ControllerBase
{
    private readonly ISender _sender;

    public RecipesController(ISender sender) => _sender = sender;

    /// <summary>Returns all recipes with their ingredients.</summary>
    [HttpGet]
    public async Task<ActionResult<List<RecipeDto>>> GetAll(CancellationToken cancellationToken)
    {
        var recipes = await _sender.Send(new GetRecipesQuery(), cancellationToken);
        return Ok(recipes);
    }

    /// <summary>Creates a new recipe from a list of ingredient + gram amounts.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateRecipeCommand command,
        CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>Deletes a recipe (e.g. test/mistake entries).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteRecipeCommand(id), cancellationToken);
        return NoContent();
    }
}
