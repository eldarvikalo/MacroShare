using FluentValidation;

namespace MacroShare.Application.Features.Households.RemovePantryItem;

public class RemovePantryItemCommandValidator : AbstractValidator<RemovePantryItemCommand>
{
    public RemovePantryItemCommandValidator()
    {
        RuleFor(x => x.HouseholdId).GreaterThan(0);
        RuleFor(x => x.IngredientId).GreaterThan(0);
    }
}
