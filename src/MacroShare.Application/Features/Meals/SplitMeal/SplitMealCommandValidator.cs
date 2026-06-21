using FluentValidation;

namespace MacroShare.Application.Features.Meals.SplitMeal;

public class SplitMealCommandValidator : AbstractValidator<SplitMealCommand>
{
    public SplitMealCommandValidator()
    {
        RuleFor(x => x.RecipeId).GreaterThan(0);

        RuleFor(x => x.UserIds)
            .NotEmpty().WithMessage("Select at least one household member to cook for.");

        RuleForEach(x => x.UserIds).GreaterThan(0);
    }
}
