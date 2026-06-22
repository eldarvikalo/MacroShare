using MacroShare.Domain.Entities;

namespace MacroShare.Application.Common.Interfaces;

public interface IPantryRepository
{
    /// <summary>Returns the set of ingredient ids currently available in the household pantry.</summary>
    Task<HashSet<int>> GetIngredientIdsAsync(int householdId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Features.Households.GetHouseholdPantry.PantryItemDto>> GetItemsAsync(
        int householdId,
        CancellationToken cancellationToken = default);

    Task<int> GetPantryIdForHouseholdAsync(int householdId, CancellationToken cancellationToken = default);

    Task<PantryItem?> FindItemAsync(
        int householdId,
        int ingredientId,
        CancellationToken cancellationToken = default);

    Task<Features.Households.GetHouseholdPantry.PantryItemDto?> GetItemDtoAsync(
        int householdId,
        int ingredientId,
        CancellationToken cancellationToken = default);

    Task AddItemAsync(PantryItem item, CancellationToken cancellationToken = default);

    Task RemoveItemAsync(PantryItem item, CancellationToken cancellationToken = default);
}
