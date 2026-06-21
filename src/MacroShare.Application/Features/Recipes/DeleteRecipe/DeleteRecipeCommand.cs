using MediatR;

namespace MacroShare.Application.Features.Recipes.DeleteRecipe;

public record DeleteRecipeCommand(int RecipeId) : IRequest;
