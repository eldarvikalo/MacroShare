using MacroShare.Domain.Entities;

namespace MacroShare.Application.Common.Interfaces;

public interface ITokenGenerator
{
    string GenerateToken(AppUser user);
}
