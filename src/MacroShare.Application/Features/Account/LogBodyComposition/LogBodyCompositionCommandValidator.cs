using FluentValidation;

namespace MacroShare.Application.Features.Account.LogBodyComposition;

public class LogBodyCompositionCommandValidator : AbstractValidator<LogBodyCompositionCommand>
{
    public LogBodyCompositionCommandValidator()
    {
        RuleFor(x => x.WeightKg).GreaterThan(0);
        RuleFor(x => x.MeasuredAt).NotEmpty();
    }
}
