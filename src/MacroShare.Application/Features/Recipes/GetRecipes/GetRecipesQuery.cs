using MediatR;

namespace MacroShare.Application.Features.Recipes.GetRecipes;

public record GetRecipesQuery : IRequest<List<RecipeDto>>;
