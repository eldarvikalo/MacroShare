using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MediatR;

namespace MacroShare.Application.Features.Account.LogBodyComposition;

public class LogBodyCompositionCommandHandler : IRequestHandler<LogBodyCompositionCommand, BodyCompositionEntryDto>
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserRepository _users;
    private readonly IBodyCompositionRepository _bodyComposition;
    private readonly IUnitOfWork _unitOfWork;

    public LogBodyCompositionCommandHandler(
        ICurrentUser currentUser,
        IUserRepository users,
        IBodyCompositionRepository bodyComposition,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _users = users;
        _bodyComposition = bodyComposition;
        _unitOfWork = unitOfWork;
    }

    public async Task<BodyCompositionEntryDto> Handle(
        LogBodyCompositionCommand request,
        CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
            throw new UnauthorizedException("Not authenticated.");

        var user = await _users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken)
            ?? throw new NotFoundException("User", _currentUser.UserId.Value);

        var entry = new BodyCompositionEntry
        {
            AppUserId = user.Id,
            MeasuredAt = request.MeasuredAt,
            WeightKg = request.WeightKg,
            Bmi = request.Bmi,
            BodyFatPercent = request.BodyFatPercent,
            BodyScore = request.BodyScore,
            BodyWaterKg = request.BodyWaterKg,
            BodyWaterPercent = request.BodyWaterPercent,
            FatMassKg = request.FatMassKg,
            BoneMineralKg = request.BoneMineralKg,
            BoneMineralPercent = request.BoneMineralPercent,
            ProteinMassKg = request.ProteinMassKg,
            ProteinPercent = request.ProteinPercent,
            MuscleMassKg = request.MuscleMassKg,
            MusclePercent = request.MusclePercent,
            SkeletalMuscleKg = request.SkeletalMuscleKg,
            VisceralFatRating = request.VisceralFatRating,
            Bmr = request.Bmr,
            WaistHipRatio = request.WaistHipRatio,
            BodyAge = request.BodyAge,
            FatFreeBodyWeightKg = request.FatFreeBodyWeightKg,
            HeartRateBpm = request.HeartRateBpm,
            StandardWeightKg = request.StandardWeightKg,
            WeightControlKg = request.WeightControlKg,
            FatControlKg = request.FatControlKg,
            MuscleControlKg = request.MuscleControlKg,
            BodyTypeLabel = request.BodyTypeLabel,
            Notes = request.Notes
        };

        await _bodyComposition.AddAsync(entry, cancellationToken);

        if (request.ApplyToProfile)
        {
            user.WeightKg = request.WeightKg;
            if (request.Bmr is not null)
                user.Bmr = request.Bmr.Value;
            if (request.BodyAge is not null)
                user.Age = request.BodyAge;

            if (request.RecalculateTargets && request.Bmr is not null)
            {
                var tdee = request.Bmr.Value * user.ActivityMultiplier;
                // Moderate deficit for fat loss while keeping protein high.
                user.TargetCalories = Math.Round(tdee * 0.85m, 0);
                user.TargetProtein = Math.Round(Math.Max(user.WeightKg * 1.8m, 90m), 0);
            }

            await _users.UpdateAsync(user, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new BodyCompositionEntryDto(
            entry.Id,
            entry.MeasuredAt,
            entry.WeightKg,
            entry.Bmi,
            entry.BodyFatPercent,
            entry.BodyScore,
            entry.Bmr,
            entry.MuscleMassKg,
            entry.FatMassKg,
            entry.StandardWeightKg,
            entry.WeightControlKg,
            entry.BodyTypeLabel,
            entry.Notes);
    }
}
