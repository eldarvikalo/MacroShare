using FluentValidation;

namespace MacroShare.Application.Features.Meals.LogMeal;

public class LogMealCommandValidator : AbstractValidator<LogMealCommand>
{
    public LogMealCommandValidator()
    {
        RuleFor(x => x.RecipeId).GreaterThan(0);
        RuleFor(x => x.Portions).NotEmpty();
    }
}
