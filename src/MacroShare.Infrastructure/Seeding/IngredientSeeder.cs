using System.Text.Json;
using MacroShare.Domain.Entities;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MacroShare.Infrastructure.Seeding;

/// <summary>
/// Streams a (potentially 10k+ row) ingredients.json file into the database in batches.
/// Idempotent: only ingredients whose name is not already present are inserted.
/// </summary>
public class IngredientSeeder
{
    private const int BatchSize = 500;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly MacroShareDbContext _db;
    private readonly ILogger<IngredientSeeder> _logger;

    public IngredientSeeder(MacroShareDbContext db, ILogger<IngredientSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SeedAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Ingredient seed file not found at {Path}; skipping ingredient seed.", filePath);
            return;
        }

        await using var stream = File.OpenRead(filePath);
        var records = await JsonSerializer.DeserializeAsync<List<IngredientSeedRecord>>(
            stream, JsonOptions, cancellationToken) ?? new List<IngredientSeedRecord>();

        if (records.Count == 0)
        {
            _logger.LogWarning("Ingredient seed file {Path} contained no records.", filePath);
            return;
        }

        var existingNames = (await _db.Ingredients
                .Select(i => i.Name)
                .ToListAsync(cancellationToken))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var batch = new List<Ingredient>(BatchSize);
        var inserted = 0;

        foreach (var record in records)
        {
            var name = record.Name?.Trim();
            if (string.IsNullOrWhiteSpace(name) || !existingNames.Add(name))
                continue;

            batch.Add(new Ingredient
            {
                Name = name,
                CaloriesPer100g = record.CaloriesPer100g,
                ProteinPer100g = record.ProteinPer100g,
                CarbsPer100g = record.CarbsPer100g,
                FatPer100g = record.FatPer100g,
                SugarPer100g = record.SugarPer100g,
                IsCustom = false
            });

            if (batch.Count >= BatchSize)
                inserted += await FlushAsync(batch, cancellationToken);
        }

        if (batch.Count > 0)
            inserted += await FlushAsync(batch, cancellationToken);

        _logger.LogInformation("Ingredient seed complete: {Count} new ingredients inserted.", inserted);
    }

    private async Task<int> FlushAsync(List<Ingredient> batch, CancellationToken cancellationToken)
    {
        await _db.Ingredients.AddRangeAsync(batch, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        var count = batch.Count;
        batch.Clear();
        return count;
    }
}
