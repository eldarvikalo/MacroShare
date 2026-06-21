using MacroShare.Domain.Enums;

namespace MacroShare.Application.Features.Households.GetHouseholdMembers;

public record HouseholdMemberDto(
    int Id,
    string Name,
    Sex Sex,
    decimal HeightCm,
    decimal WeightKg,
    decimal Bmr,
    decimal Tdee,
    decimal TargetCalories,
    decimal TargetProtein,
    string? AvatarColor);
