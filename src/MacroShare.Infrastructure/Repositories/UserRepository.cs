using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly MacroShareDbContext _db;

    public UserRepository(MacroShareDbContext db) => _db = db;

    public Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => _db.AppUsers.FirstOrDefaultAsync(u => u.Email == email.ToLower(), cancellationToken);

    public Task<AppUser?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => _db.AppUsers.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<AppUser?> GetByIdWithHouseholdAsync(int id, CancellationToken cancellationToken = default)
        => _db.AppUsers
            .Include(u => u.Household)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task UpdateAsync(AppUser user, CancellationToken cancellationToken = default)
    {
        _db.AppUsers.Update(user);
        return Task.CompletedTask;
    }
}
