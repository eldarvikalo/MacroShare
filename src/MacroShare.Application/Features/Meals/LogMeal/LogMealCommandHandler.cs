using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MediatR;

namespace MacroShare.Application.Features.Meals.LogMeal;

public class LogMealCommandHandler : IRequestHandler<LogMealCommand>
{
    private readonly ICurrentUser _currentUser;
    private readonly IHouseholdRepository _households;
    private readonly IMealLogRepository _mealLogs;
    private readonly IUnitOfWork _unitOfWork;

    public LogMealCommandHandler(
        ICurrentUser currentUser,
        IHouseholdRepository households,
        IMealLogRepository mealLogs,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _households = households;
        _mealLogs = mealLogs;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(LogMealCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.HouseholdId is null)
            throw new UnauthorizedException("Not authenticated.");

        var members = await _households.GetMembersAsync(_currentUser.HouseholdId.Value, cancellationToken);
        var memberIds = members.Select(m => m.Id).ToHashSet();

        foreach (var portion in request.Portions)
        {
            if (!memberIds.Contains(portion.UserId))
                throw new ForbiddenException("Cannot log meals for users outside your household.");
        }

        var mealLog = new MealLog
        {
            HouseholdId = _currentUser.HouseholdId.Value,
            Date = request.Date ?? DateOnly.FromDateTime(DateTime.UtcNow),
            MealType = request.MealType,
            RecipeId = request.RecipeId,
            Entries = request.Portions.Select(p => new MealLogEntry
            {
                AppUserId = p.UserId,
                PortionGrams = p.PortionGrams,
                Calories = p.Calories,
                Protein = p.Protein,
                Carbs = p.Carbs,
                Fat = p.Fat,
                Sugar = p.Sugar
            }).ToList()
        };

        await _mealLogs.AddAsync(mealLog, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
