using MacroShare.Domain.Entities;

namespace MacroShare.Application.Common.Interfaces;

public interface IHouseholdRepository
{
    Task<Household?> GetWithMembersAsync(int householdId, CancellationToken cancellationToken = default);

    Task<List<AppUser>> GetMembersAsync(int householdId, CancellationToken cancellationToken = default);

    Task<List<AppUser>> GetUsersByIdsAsync(IEnumerable<int> userIds, CancellationToken cancellationToken = default);
}
