namespace MacroShare.Application.Common.Interfaces;

public interface IPantryRepository
{
    /// <summary>Returns the set of ingredient ids currently available in the household pantry.</summary>
    Task<HashSet<int>> GetIngredientIdsAsync(int householdId, CancellationToken cancellationToken = default);
}
