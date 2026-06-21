using MacroShare.Domain.Entities;

namespace MacroShare.Application.Common.Interfaces;

public interface IBodyCompositionRepository
{
    Task AddAsync(BodyCompositionEntry entry, CancellationToken cancellationToken = default);
    Task<List<BodyCompositionEntry>> GetHistoryAsync(int userId, int take, CancellationToken cancellationToken = default);
    Task<BodyCompositionEntry?> GetLatestAsync(int userId, CancellationToken cancellationToken = default);
}
