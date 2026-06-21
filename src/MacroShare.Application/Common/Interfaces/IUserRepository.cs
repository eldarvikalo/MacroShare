using MacroShare.Domain.Entities;

namespace MacroShare.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AppUser?> GetByIdWithHouseholdAsync(int id, CancellationToken cancellationToken = default);
    Task UpdateAsync(AppUser user, CancellationToken cancellationToken = default);
}
