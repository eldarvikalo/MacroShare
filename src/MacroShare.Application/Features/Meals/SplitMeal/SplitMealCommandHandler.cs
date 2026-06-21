using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Application.Common.Models;
using MacroShare.Domain.Entities;
using MacroShare.Domain.Services;
using MediatR;

namespace MacroShare.Application.Features.Meals.SplitMeal;

public class SplitMealCommandHandler : IRequestHandler<SplitMealCommand, MealSplitResultDto>
{
    private readonly IRecipeRepository _recipes;
    private readonly IHouseholdRepository _households;
    private readonly IMealLogRepository _mealLogs;
    private readonly IMealSplitterService _splitter;

    public SplitMealCommandHandler(
        IRecipeRepository recipes,
        IHouseholdRepository households,
        IMealLogRepository mealLogs,
        IMealSplitterService splitter)
    {
        _recipes = recipes;
        _households = households;
        _mealLogs = mealLogs;
        _splitter = splitter;
    }

    public async Task<MealSplitResultDto> Handle(SplitMealCommand request, CancellationToken cancellationToken)
    {
        var recipe = await _recipes.GetWithIngredientsAsync(request.RecipeId, cancellationToken)
            ?? throw new NotFoundException(nameof(Recipe), request.RecipeId);

        var users = await _households.GetUsersByIdsAsync(request.UserIds, cancellationToken);
        if (users.Count == 0)
            throw new NotFoundException("No participants found for the supplied user ids.");

        var missing = request.UserIds.Except(users.Select(u => u.Id)).ToList();
        if (missing.Count != 0)
            throw new NotFoundException($"User(s) not found: {string.Join(", ", missing)}.");

        // Keep the original selection order for a stable UI.
        var ordered = request.UserIds
            .Select(id => users.First(u => u.Id == id))
            .ToList();

        var date = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var householdId = ordered[0].HouseholdId;
        var consumed = await _mealLogs.GetConsumedCaloriesAsync(householdId, date, cancellationToken);

        var result = _splitter.Split(recipe, ordered, consumed);

        return Map(recipe, result, ordered);
    }

    private static MealSplitResultDto Map(Recipe recipe, MealSplitResult result, List<AppUser> users)
    {
        var colorByUser = users.ToDictionary(u => u.Id, u => u.AvatarColor);

        var portions = result.Portions
            .Select(p => new PersonPortionDto(
                p.UserId,
                p.Name,
                colorByUser.TryGetValue(p.UserId, out var color) ? color : null,
                p.RatioPercent,
                p.PortionGrams,
                p.Calories,
                p.Protein,
                p.Carbs,
                p.Fat,
                p.Sugar))
            .ToList();

        var totals = new MacrosDto(
            result.TotalMeal.TotalGrams,
            result.TotalMeal.Calories,
            result.TotalMeal.Protein,
            result.TotalMeal.Carbs,
            result.TotalMeal.Fat,
            result.TotalMeal.Sugar);

        return new MealSplitResultDto(recipe.Id, recipe.Name, totals, portions);
    }
}
