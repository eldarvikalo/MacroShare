using FluentValidation;

namespace MacroShare.Application.Features.Households.AddPantryItem;

public class AddPantryItemCommandValidator : AbstractValidator<AddPantryItemCommand>
{
    public AddPantryItemCommandValidator()
    {
        RuleFor(x => x.HouseholdId).GreaterThan(0);
        RuleFor(x => x.IngredientId).GreaterThan(0);
        RuleFor(x => x.QuantityGrams).GreaterThan(0);
    }
}
