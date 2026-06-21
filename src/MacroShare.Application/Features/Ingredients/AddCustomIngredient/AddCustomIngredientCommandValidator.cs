using FluentValidation;

namespace MacroShare.Application.Features.Ingredients.AddCustomIngredient;

public class AddCustomIngredientCommandValidator : AbstractValidator<AddCustomIngredientCommand>
{
    public AddCustomIngredientCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CaloriesPer100g).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ProteinPer100g).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CarbsPer100g).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FatPer100g).GreaterThanOrEqualTo(0);
        RuleFor(x => x.SugarPer100g).GreaterThanOrEqualTo(0);
    }
}
