using MacroShare.Domain.Enums;
using MediatR;

namespace MacroShare.Application.Features.Meals.GetMealSuggestions;

public record GetMealSuggestionsQuery(int HouseholdId, MealType Type)
    : IRequest<List<MealSuggestionDto>>;
