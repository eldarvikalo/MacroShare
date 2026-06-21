using FluentValidation;

namespace MacroShare.Application.Features.Recipes.CreateRecipe;

public class CreateRecipeCommandValidator : AbstractValidator<CreateRecipeCommand>
{
    public CreateRecipeCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Add at least one ingredient to the recipe.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.IngredientId).GreaterThan(0);
            item.RuleFor(i => i.QuantityGrams).GreaterThan(0);
        });
    }
}
