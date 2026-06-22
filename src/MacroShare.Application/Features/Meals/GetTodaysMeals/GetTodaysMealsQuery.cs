using MediatR;

namespace MacroShare.Application.Features.Meals.GetTodaysMeals;

public record GetTodaysMealsQuery(int HouseholdId, DateOnly? Date = null) : IRequest<List<TodaysMealDto>>;
