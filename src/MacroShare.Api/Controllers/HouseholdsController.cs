using MacroShare.Api.Extensions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Application.Features.Households.AddPantryItem;
using MacroShare.Application.Features.Households.GetHouseholdMembers;
using MacroShare.Application.Features.Households.GetHouseholdPantry;
using MacroShare.Application.Features.Households.RemovePantryItem;
using MacroShare.Application.Features.Households.UpdatePantryItem;
using MacroShare.Application.Features.Meals.GetMealSuggestions;
using MacroShare.Application.Features.Meals.GetTodaysMeals;
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

    /// <summary>Returns all ingredients currently stocked in the household pantry.</summary>
    [HttpGet("{householdId:int}/pantry")]
    public async Task<ActionResult<List<PantryItemDto>>> GetPantry(
        int householdId,
        CancellationToken cancellationToken)
    {
        _currentUser.EnsureHouseholdAccess(householdId);
        var items = await _sender.Send(new GetHouseholdPantryQuery(householdId), cancellationToken);
        return Ok(items);
    }

    /// <summary>Adds an ingredient to the pantry (or increases stock if already present).</summary>
    [HttpPost("{householdId:int}/pantry/items")]
    public async Task<ActionResult<PantryItemDto>> AddPantryItem(
        int householdId,
        [FromBody] UpsertPantryItemRequest request,
        CancellationToken cancellationToken)
    {
        _currentUser.EnsureHouseholdAccess(householdId);
        var item = await _sender.Send(
            new AddPantryItemCommand(householdId, request.IngredientId, request.QuantityGrams),
            cancellationToken);
        return Ok(item);
    }

    /// <summary>Sets the exact quantity for a pantry ingredient.</summary>
    [HttpPut("{householdId:int}/pantry/items/{ingredientId:int}")]
    public async Task<ActionResult<PantryItemDto>> UpdatePantryItem(
        int householdId,
        int ingredientId,
        [FromBody] UpdatePantryQuantityRequest request,
        CancellationToken cancellationToken)
    {
        _currentUser.EnsureHouseholdAccess(householdId);
        var item = await _sender.Send(
            new UpdatePantryItemCommand(householdId, ingredientId, request.QuantityGrams),
            cancellationToken);
        return Ok(item);
    }

    /// <summary>Removes an ingredient from the household pantry.</summary>
    [HttpDelete("{householdId:int}/pantry/items/{ingredientId:int}")]
    public async Task<IActionResult> RemovePantryItem(
        int householdId,
        int ingredientId,
        CancellationToken cancellationToken)
    {
        _currentUser.EnsureHouseholdAccess(householdId);
        await _sender.Send(new RemovePantryItemCommand(householdId, ingredientId), cancellationToken);
        return NoContent();
    }

    /// <summary>Returns meals logged today for the household dashboard timeline.</summary>
    [HttpGet("{householdId:int}/meals/today")]
    public async Task<ActionResult<List<TodaysMealDto>>> GetTodaysMeals(
        int householdId,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
    {
        _currentUser.EnsureHouseholdAccess(householdId);
        var meals = await _sender.Send(new GetTodaysMealsQuery(householdId, date), cancellationToken);
        return Ok(meals);
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
