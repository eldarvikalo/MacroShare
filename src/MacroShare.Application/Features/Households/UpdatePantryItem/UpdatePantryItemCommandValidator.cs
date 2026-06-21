using FluentValidation;

namespace MacroShare.Application.Features.Households.UpdatePantryItem;

public class UpdatePantryItemCommandValidator : AbstractValidator<UpdatePantryItemCommand>
{
    public UpdatePantryItemCommandValidator()
    {
        RuleFor(x => x.HouseholdId).GreaterThan(0);
        RuleFor(x => x.IngredientId).GreaterThan(0);
        RuleFor(x => x.QuantityGrams).GreaterThan(0);
    }
}
