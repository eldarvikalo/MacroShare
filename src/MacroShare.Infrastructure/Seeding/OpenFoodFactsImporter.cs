using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using MacroShare.Domain.Entities;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MacroShare.Infrastructure.Seeding;

/// <summary>
/// Streams the Open Food Facts tab-separated export (multi-GB, millions of rows) and imports
/// a quality-filtered, completeness-ranked, de-duplicated subset of foods into the Ingredients
/// table. Designed to be run once from the CLI (`dotnet run --project src/MacroShare.Api -- import-off`).
/// </summary>
public class OpenFoodFactsImporter
{
    private const int InsertBatchSize = 1000;

    // Sanity bounds to reject garbage rows.
    private const decimal MaxKcalPer100g = 950m;   // pure fat ~900 kcal
    private const decimal MaxMacroPer100g = 100m;

    private readonly MacroShareDbContext _db;
    private readonly ILogger<OpenFoodFactsImporter> _logger;

    public OpenFoodFactsImporter(MacroShareDbContext db, ILogger<OpenFoodFactsImporter> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<int> ImportAsync(string filePath, int maxItems, CancellationToken cancellationToken = default)
    {
        if (!File.Exists(filePath))
        {
            _logger.LogError("Open Food Facts file not found at {Path}.", filePath);
            return 0;
        }

        _logger.LogInformation("Scanning {Path} for the top {Max} foods by completeness...", filePath, maxItems);

        var best = SelectBest(filePath, maxItems, cancellationToken);
        _logger.LogInformation("Selected {Count} candidate foods after quality filtering.", best.Count);

        var inserted = await PersistAsync(best, cancellationToken);
        _logger.LogInformation("Open Food Facts import complete: {Count} new ingredients inserted.", inserted);
        return inserted;
    }

    private sealed record Candidate(
        string Name,
        decimal Calories,
        decimal Protein,
        decimal Carbs,
        decimal Fat,
        decimal Sugar,
        double Completeness);

    /// <summary>
    /// Single streaming pass keeping only the top <paramref name="maxItems"/> rows by completeness
    /// using a bounded min-heap, so memory stays proportional to the cap, not the file size.
    /// </summary>
    private List<Candidate> SelectBest(string filePath, int maxItems, CancellationToken cancellationToken)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = "\t",
            HasHeaderRecord = true,
            BadDataFound = null,
            MissingFieldFound = null,
            DetectColumnCountChanges = false,
            Mode = CsvMode.NoEscape // OFF data has unescaped quotes; treat fields literally.
        };

        // Min-heap keyed by completeness ascending: the lowest-quality item is dequeued first.
        var heap = new PriorityQueue<Candidate, double>();
        long scanned = 0, accepted = 0;

        using var reader = new StreamReader(filePath);
        using var csv = new CsvReader(reader, config);

        csv.Read();
        csv.ReadHeader();

        while (csv.Read())
        {
            cancellationToken.ThrowIfCancellationRequested();
            scanned++;

            if (scanned % 500_000 == 0)
                _logger.LogInformation("  ...scanned {Scanned:n0} rows, {Accepted:n0} accepted", scanned, accepted);

            if (csv.GetField("no_nutrition_data") == "1")
                continue;

            var name = csv.GetField("product_name")?.Trim();
            if (!IsUsableName(name))
                continue;

            if (!TryGetMacro(csv, "energy-kcal_100g", out var kcal) || kcal <= 0 || kcal > MaxKcalPer100g)
                continue;

            if (!TryGetMacro(csv, "proteins_100g", out var protein) ||
                !TryGetMacro(csv, "carbohydrates_100g", out var carbs) ||
                !TryGetMacro(csv, "fat_100g", out var fat))
                continue;

            if (!InRange(protein) || !InRange(carbs) || !InRange(fat))
                continue;

            TryGetMacro(csv, "sugars_100g", out var sugar);
            if (sugar < 0 || sugar > MaxMacroPer100g) sugar = 0;

            double completeness = 0;
            double.TryParse(csv.GetField("completeness"), NumberStyles.Any, CultureInfo.InvariantCulture, out completeness);

            var candidate = new Candidate(
                name!.Length > 200 ? name[..200] : name,
                kcal, protein, carbs, fat, sugar, completeness);

            accepted++;

            if (heap.Count < maxItems)
            {
                heap.Enqueue(candidate, completeness);
            }
            else if (completeness > heap.Peek().Completeness)
            {
                heap.Dequeue();
                heap.Enqueue(candidate, completeness);
            }
        }

        _logger.LogInformation("Scan finished: {Scanned:n0} rows read, {Accepted:n0} passed filtering.", scanned, accepted);

        // Drain heap and de-duplicate by name (case-insensitive), keeping the highest completeness.
        var byName = new Dictionary<string, Candidate>(StringComparer.OrdinalIgnoreCase);
        while (heap.Count > 0)
        {
            var c = heap.Dequeue();
            if (!byName.TryGetValue(c.Name, out var existing) || c.Completeness > existing.Completeness)
                byName[c.Name] = c;
        }

        return byName.Values.ToList();
    }

    private async Task<int> PersistAsync(List<Candidate> candidates, CancellationToken cancellationToken)
    {
        // Skip names already present (e.g. the JSON-seeded staples).
        var existing = (await _db.Ingredients.Select(i => i.Name).ToListAsync(cancellationToken))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var batch = new List<Ingredient>(InsertBatchSize);
        var inserted = 0;

        foreach (var c in candidates)
        {
            if (!existing.Add(c.Name))
                continue;

            batch.Add(new Ingredient
            {
                Name = c.Name,
                CaloriesPer100g = decimal.Round(c.Calories, 2),
                ProteinPer100g = decimal.Round(c.Protein, 2),
                CarbsPer100g = decimal.Round(c.Carbs, 2),
                FatPer100g = decimal.Round(c.Fat, 2),
                SugarPer100g = decimal.Round(c.Sugar, 2),
                IsCustom = false
            });

            if (batch.Count >= InsertBatchSize)
            {
                await _db.Ingredients.AddRangeAsync(batch, cancellationToken);
                await _db.SaveChangesAsync(cancellationToken);
                _db.ChangeTracker.Clear();
                inserted += batch.Count;
                batch.Clear();
            }
        }

        if (batch.Count > 0)
        {
            await _db.Ingredients.AddRangeAsync(batch, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            inserted += batch.Count;
        }

        return inserted;
    }

    private static bool IsUsableName(string? name)
        => !string.IsNullOrWhiteSpace(name) && name.Length <= 200 && name.Any(char.IsLetter);

    private static bool InRange(decimal value) => value >= 0 && value <= MaxMacroPer100g;

    private static bool TryGetMacro(CsvReader csv, string column, out decimal value)
    {
        var raw = csv.GetField(column);
        if (string.IsNullOrWhiteSpace(raw))
        {
            value = 0;
            return false;
        }
        return decimal.TryParse(raw, NumberStyles.Any, CultureInfo.InvariantCulture, out value);
    }
}
