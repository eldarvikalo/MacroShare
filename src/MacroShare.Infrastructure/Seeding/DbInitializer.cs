using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MacroShare.Domain.Enums;
using MacroShare.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MacroShare.Infrastructure.Seeding;

/// <summary>
/// Applies migrations, seeds ingredients from JSON, then seeds a starter household
/// (two users to match the brief), a shared pantry, and a handful of recipes so the
/// app is usable immediately. All steps are idempotent.
/// </summary>
public class DbInitializer
{
    private readonly MacroShareDbContext _db;
    private readonly IngredientSeeder _ingredientSeeder;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<DbInitializer> _logger;

    public DbInitializer(
        MacroShareDbContext db,
        IngredientSeeder ingredientSeeder,
        IPasswordHasher passwordHasher,
        ILogger<DbInitializer> logger)
    {
        _db = db;
        _ingredientSeeder = ingredientSeeder;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task InitializeAsync(string ingredientsFilePath, CancellationToken cancellationToken = default)
    {
        await _db.Database.MigrateAsync(cancellationToken);
        await _ingredientSeeder.SeedAsync(ingredientsFilePath, cancellationToken);
        await SeedHouseholdAsync(cancellationToken);
        await EnsureAuthProfilesAsync(cancellationToken);
        await EnsureBaselineBodyMetricsAsync(cancellationToken);
        await EnsurePantryStockedAsync(cancellationToken);
        await SeedRecipesAsync(cancellationToken);
    }

    private async Task SeedHouseholdAsync(CancellationToken cancellationToken)
    {
        if (await _db.Households.AnyAsync(cancellationToken))
            return;

        var household = new Household
        {
            Name = "Eldar & Dina Home",
            Members = new List<AppUser>
            {
                new()
                {
                    Name = "Eldar",
                    Email = "eldar@macroshare.app",
                    PasswordHash = string.Empty, // set in EnsureAuthProfilesAsync
                    Sex = Sex.Male,
                    Age = 22,
                    HeightCm = 186m,
                    WeightKg = 109.3m,
                    Bmr = 2031m,
                    ActivityMultiplier = 1.725m,
                    TargetCalories = 3400m,
                    TargetProtein = 230m,
                    AvatarColor = "#2563eb"
                },
                new()
                {
                    Name = "Dina",
                    Email = "dina@macroshare.app",
                    PasswordHash = string.Empty,
                    Sex = Sex.Female,
                    Age = 23,
                    HeightCm = 168m,
                    WeightKg = 62.3m,
                    Bmr = 1297m,
                    ActivityMultiplier = 1.375m,
                    TargetCalories = 1500m,
                    TargetProtein = 115m,
                    AvatarColor = "#db2777"
                }
            }
        };

        household.Pantry = new HouseholdPantry();

        _db.Households.Add(household);
        await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Ensures login credentials exist and legacy Alex/Sam names are migrated to Eldar/Dina.
    /// </summary>
    private async Task EnsureAuthProfilesAsync(CancellationToken cancellationToken)
    {
        const string defaultPassword = "EldarDina18041006!";
        var users = await _db.AppUsers.ToListAsync(cancellationToken);
        var changed = false;

        foreach (var user in users)
        {
            if (user.Name.Equals("Alex", StringComparison.OrdinalIgnoreCase))
            {
                user.Name = "Eldar";
                user.Email = "eldar@macroshare.app";
                changed = true;
            }
            else if (user.Name.Equals("Sam", StringComparison.OrdinalIgnoreCase))
            {
                user.Name = "Dina";
                user.Email = "dina@macroshare.app";
                changed = true;
            }
            else if (user.Name.Equals("Eldar", StringComparison.OrdinalIgnoreCase)
                     && !user.Email.Equals("eldar@macroshare.app", StringComparison.OrdinalIgnoreCase))
            {
                user.Email = "eldar@macroshare.app";
                changed = true;
            }
            else if (user.Name.Equals("Dina", StringComparison.OrdinalIgnoreCase)
                     && !user.Email.Equals("dina@macroshare.app", StringComparison.OrdinalIgnoreCase))
            {
                user.Email = "dina@macroshare.app";
                changed = true;
            }
            else if (string.IsNullOrWhiteSpace(user.Email) || user.Email.StartsWith("legacy-", StringComparison.Ordinal))
            {
                user.Email = $"{user.Name.ToLowerInvariant()}@macroshare.app";
                changed = true;
            }

            user.Email = user.Email.ToLowerInvariant();

            var isDemoAccount =
                user.Email.Equals("eldar@macroshare.app", StringComparison.OrdinalIgnoreCase)
                || user.Email.Equals("dina@macroshare.app", StringComparison.OrdinalIgnoreCase);

            if (string.IsNullOrWhiteSpace(user.PasswordHash) || isDemoAccount)
            {
                user.PasswordHash = _passwordHasher.Hash(defaultPassword);
                changed = true;
            }
        }

        if (changed)
            await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Seeds the first smart-scale readings from the couple's baseline measurements.
    /// </summary>
    private async Task EnsureBaselineBodyMetricsAsync(CancellationToken cancellationToken)
    {
        if (await _db.BodyCompositionEntries.AnyAsync(cancellationToken))
            return;

        var users = await _db.AppUsers.ToListAsync(cancellationToken);
        var eldar = users.FirstOrDefault(u => u.Name == "Eldar" || u.Name == "Alex");
        var dina = users.FirstOrDefault(u => u.Name == "Dina" || u.Name == "Sam");

        if (eldar is not null)
        {
            _db.BodyCompositionEntries.Add(new BodyCompositionEntry
            {
                AppUserId = eldar.Id,
                MeasuredAt = new DateTime(2024, 6, 5, 23, 51, 0, DateTimeKind.Utc),
                WeightKg = 109.3m,
                Bmi = 31.9m,
                BodyFatPercent = 29.6m,
                BodyScore = 78,
                BodyWaterKg = 60.8m,
                BodyWaterPercent = 55.6m,
                FatMassKg = 32.4m,
                BoneMineralKg = 4.3m,
                BoneMineralPercent = 3.9m,
                ProteinMassKg = 10.8m,
                ProteinPercent = 9.9m,
                MuscleMassKg = 72.6m,
                MusclePercent = 66.4m,
                SkeletalMuscleKg = 45m,
                VisceralFatRating = 13,
                Bmr = 2031m,
                WaistHipRatio = 0.9m,
                BodyAge = 22,
                FatFreeBodyWeightKg = 76.9m,
                HeartRateBpm = 52,
                StandardWeightKg = 73.5m,
                WeightControlKg = -35.8m,
                FatControlKg = -21.4m,
                BodyTypeLabel = "Obese",
                Notes = "Baseline smart-scale reading — start of cut journey."
            });
        }

        if (dina is not null)
        {
            _db.BodyCompositionEntries.Add(new BodyCompositionEntry
            {
                AppUserId = dina.Id,
                MeasuredAt = new DateTime(2024, 6, 6, 23, 53, 0, DateTimeKind.Utc),
                WeightKg = 62.3m,
                Bmi = 22.9m,
                BodyFatPercent = 31.2m,
                BodyScore = 78,
                BodyWaterKg = 31.9m,
                BodyWaterPercent = 51.2m,
                FatMassKg = 19.4m,
                BoneMineralKg = 2.5m,
                BoneMineralPercent = 4m,
                ProteinMassKg = 8.1m,
                ProteinPercent = 13m,
                MuscleMassKg = 40.4m,
                MusclePercent = 64.8m,
                SkeletalMuscleKg = 22.6m,
                VisceralFatRating = 8,
                Bmr = 1297m,
                WaistHipRatio = 0.7m,
                BodyAge = 23,
                FatFreeBodyWeightKg = 42.9m,
                HeartRateBpm = 100,
                StandardWeightKg = 57m,
                WeightControlKg = -5.3m,
                FatControlKg = -6.3m,
                MuscleControlKg = 1m,
                BodyTypeLabel = "Overweight",
                Notes = "Baseline smart-scale reading — start of cut journey."
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Idempotently stocks the household pantry with the staples used by the seeded recipes,
    /// so the curated healthy recipes surface under Pantry Suggestions. Adds only missing items.
    /// </summary>
    private async Task EnsurePantryStockedAsync(CancellationToken cancellationToken)
    {
        var pantry = await _db.HouseholdPantries
            .OrderBy(p => p.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (pantry is null)
            return;

        var existingIngredientIds = await _db.PantryItems
            .Where(pi => pi.PantryId == pantry.Id)
            .Select(pi => pi.IngredientId)
            .ToListAsync(cancellationToken);
        var stockedIds = existingIngredientIds.ToHashSet();

        var names = StockedStaples.Select(s => s.Name).ToList();
        var ingredientsByName = await _db.Ingredients
            .Where(i => names.Contains(i.Name))
            .ToDictionaryAsync(i => i.Name, cancellationToken);

        var added = 0;
        foreach (var (name, grams) in StockedStaples)
        {
            if (!ingredientsByName.TryGetValue(name, out var ingredient))
            {
                _logger.LogWarning("Pantry seed: ingredient '{Name}' not found in DB.", name);
                continue;
            }
            if (stockedIds.Contains(ingredient.Id))
                continue;

            _db.PantryItems.Add(new PantryItem
            {
                PantryId = pantry.Id,
                IngredientId = ingredient.Id,
                QuantityGrams = grams
            });
            added++;
        }

        if (added > 0)
            await _db.SaveChangesAsync(cancellationToken);
    }

    private static readonly (string Name, decimal Grams)[] StockedStaples =
    {
        ("Chicken Breast (raw)", 1000m),
        ("Chicken Thigh (skinless, raw)", 800m),
        ("Lean Beef Mince (5% fat)", 800m),
        ("Beef Steak (sirloin, raw)", 600m),
        ("Salmon Fillet", 600m),
        ("Cod Fillet", 600m),
        ("Tuna (canned in water)", 400m),
        ("Shrimp (raw)", 500m),
        ("Turkey Breast Mince", 700m),
        ("Egg (whole)", 600m),
        ("Egg White", 500m),
        ("Tofu (firm)", 500m),
        ("White Rice (cooked)", 1200m),
        ("Brown Rice (cooked)", 800m),
        ("Quinoa (cooked)", 800m),
        ("Rolled Oats", 800m),
        ("Lentils (cooked)", 600m),
        ("Chickpeas (cooked)", 600m),
        ("Black Beans (cooked)", 600m),
        ("Sweet Potato", 1000m),
        ("Broccoli", 700m),
        ("Cauliflower", 500m),
        ("Spinach", 400m),
        ("Kale", 300m),
        ("Bell Pepper (red)", 400m),
        ("Bell Pepper (green)", 300m),
        ("Onion", 500m),
        ("Garlic", 150m),
        ("Tomato", 500m),
        ("Cucumber", 300m),
        ("Carrot", 400m),
        ("Green Beans", 300m),
        ("Asparagus", 300m),
        ("Brussels Sprouts", 300m),
        ("Cabbage", 400m),
        ("Lettuce", 300m),
        ("Avocado", 300m),
        ("Banana", 600m),
        ("Apple", 400m),
        ("Blueberries", 300m),
        ("Strawberries", 300m),
        ("Greek Yogurt (0% fat)", 1000m),
        ("Cottage Cheese", 500m),
        ("Milk (semi-skimmed)", 1000m),
        ("Almonds", 300m),
        ("Walnuts", 200m),
        ("Chia Seeds", 200m),
        ("Olive Oil", 500m),
        ("Honey", 250m),
        ("Whey Protein Powder", 1000m)
    };

    private async Task SeedRecipesAsync(CancellationToken cancellationToken)
    {
        // Idempotent per-recipe: only insert blueprints whose name is not already present,
        // so the curated pack can be added to an existing database without duplicates.
        var existingNames = (await _db.Recipes.Select(r => r.Name).ToListAsync(cancellationToken))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var pending = RecipeBlueprints.Where(b => !existingNames.Contains(b.Name)).ToList();
        if (pending.Count == 0)
            return;

        var allNames = pending
            .SelectMany(r => r.Ingredients.Select(i => i.Name))
            .Distinct()
            .ToList();

        var ingredientsByName = await _db.Ingredients
            .Where(i => allNames.Contains(i.Name))
            .ToDictionaryAsync(i => i.Name, cancellationToken);

        foreach (var blueprint in pending)
        {
            var recipe = new Recipe
            {
                Name = blueprint.Name,
                MealType = blueprint.MealType,
                Instructions = blueprint.Instructions
            };

            foreach (var (name, grams) in blueprint.Ingredients)
            {
                if (ingredientsByName.TryGetValue(name, out var ingredient))
                {
                    recipe.Ingredients.Add(new RecipeIngredient
                    {
                        IngredientId = ingredient.Id,
                        QuantityGrams = grams
                    });
                }
                else
                {
                    _logger.LogWarning("Recipe seed: ingredient '{Name}' not found for '{Recipe}'.", name, blueprint.Name);
                }
            }

            if (recipe.Ingredients.Count > 0)
                _db.Recipes.Add(recipe);
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    private record RecipeBlueprint(
        string Name,
        MealType MealType,
        string Instructions,
        (string Name, decimal Grams)[] Ingredients);

    private static readonly RecipeBlueprint[] RecipeBlueprints =
    {
        new("Grilled Chicken & Rice Bowl", MealType.Lunch,
            "Grill the chicken, steam the rice and broccoli, drizzle with olive oil and combine.",
            new[]
            {
                ("Chicken Breast (raw)", 500m),
                ("White Rice (cooked)", 300m),
                ("Broccoli", 200m),
                ("Olive Oil", 15m)
            }),
        new("Beef & Sweet Potato Skillet", MealType.Dinner,
            "Brown the beef with onion, add cubed sweet potato and cook until tender.",
            new[]
            {
                ("Lean Beef Mince (5% fat)", 500m),
                ("Sweet Potato", 400m),
                ("Onion", 100m),
                ("Olive Oil", 15m)
            }),
        new("Salmon with Quinoa & Greens", MealType.Dinner,
            "Bake the salmon, serve over quinoa with wilted spinach.",
            new[]
            {
                ("Salmon Fillet", 400m),
                ("Quinoa (cooked)", 300m),
                ("Spinach", 150m),
                ("Olive Oil", 10m)
            }),
        new("Protein Power Oats", MealType.Breakfast,
            "Cook oats with milk, stir in whey, top with banana and blueberries.",
            new[]
            {
                ("Rolled Oats", 120m),
                ("Milk (semi-skimmed)", 300m),
                ("Whey Protein Powder", 60m),
                ("Banana", 120m),
                ("Blueberries", 100m)
            }),
        new("Veggie Omelette", MealType.Breakfast,
            "Whisk eggs, pour over sauteed peppers and spinach, fold and serve.",
            new[]
            {
                ("Egg (whole)", 200m),
                ("Bell Pepper (red)", 80m),
                ("Spinach", 50m),
                ("Olive Oil", 10m)
            }),
        new("Greek Yogurt, Almonds & Honey", MealType.Snack,
            "Spoon yogurt into a bowl, top with almonds and a drizzle of honey.",
            new[]
            {
                ("Greek Yogurt (0% fat)", 250m),
                ("Almonds", 30m),
                ("Honey", 15m)
            }),
        new("Turkey Lettuce Wraps", MealType.Lunch,
            "Cook the turkey with onion and tomato, spoon into lettuce cups.",
            new[]
            {
                ("Turkey Breast Mince", 450m),
                ("Lettuce", 150m),
                ("Tomato", 100m),
                ("Onion", 50m)
            }),

        // --- Curated healthy pack (high protein, low sugar, veg-forward) ---
        new("Cod, Broccoli & Brown Rice", MealType.Dinner,
            "Bake the cod, steam broccoli, serve over brown rice with a drizzle of olive oil.",
            new[] { ("Cod Fillet", 450m), ("Broccoli", 250m), ("Brown Rice (cooked)", 300m), ("Olive Oil", 10m) }),
        new("Tuna & Chickpea Salad", MealType.Lunch,
            "Toss tuna with chickpeas, cucumber, tomato and a little olive oil.",
            new[] { ("Tuna (canned in water)", 300m), ("Chickpeas (cooked)", 250m), ("Cucumber", 150m), ("Tomato", 150m), ("Olive Oil", 10m) }),
        new("Chicken & Quinoa Power Bowl", MealType.Lunch,
            "Grill chicken, combine with quinoa, spinach and peppers.",
            new[] { ("Chicken Breast (raw)", 450m), ("Quinoa (cooked)", 300m), ("Spinach", 100m), ("Bell Pepper (red)", 120m) }),
        new("Tofu & Vegetable Stir-Fry", MealType.Dinner,
            "Stir-fry firm tofu with broccoli, peppers and green beans.",
            new[] { ("Tofu (firm)", 400m), ("Broccoli", 200m), ("Bell Pepper (red)", 150m), ("Green Beans", 150m), ("Olive Oil", 10m) }),
        new("Lentil & Vegetable Soup", MealType.Lunch,
            "Simmer lentils with carrot, onion and tomato until tender.",
            new[] { ("Lentils (cooked)", 400m), ("Carrot", 150m), ("Onion", 100m), ("Tomato", 200m) }),
        new("Egg White & Spinach Scramble", MealType.Breakfast,
            "Scramble egg whites with spinach and tomato.",
            new[] { ("Egg White", 300m), ("Spinach", 100m), ("Tomato", 100m), ("Olive Oil", 5m) }),
        new("Greek Yogurt, Berries & Chia", MealType.Breakfast,
            "Layer Greek yogurt with blueberries, strawberries and chia seeds.",
            new[] { ("Greek Yogurt (0% fat)", 300m), ("Blueberries", 80m), ("Strawberries", 80m), ("Chia Seeds", 20m) }),
        new("Salmon, Asparagus & Sweet Potato", MealType.Dinner,
            "Roast salmon with asparagus and sweet potato wedges.",
            new[] { ("Salmon Fillet", 400m), ("Asparagus", 200m), ("Sweet Potato", 350m), ("Olive Oil", 10m) }),
        new("Beef & Vegetable Stir-Fry", MealType.Dinner,
            "Sear lean beef and toss with peppers, cabbage and onion.",
            new[] { ("Beef Steak (sirloin, raw)", 400m), ("Bell Pepper (green)", 150m), ("Cabbage", 200m), ("Onion", 80m), ("Olive Oil", 10m) }),
        new("Cottage Cheese & Fruit Bowl", MealType.Snack,
            "Top cottage cheese with apple and a few walnuts.",
            new[] { ("Cottage Cheese", 250m), ("Apple", 120m), ("Walnuts", 20m) }),
        new("Shrimp & Cauliflower Rice", MealType.Dinner,
            "Saute shrimp with garlic and serve over cauliflower 'rice'.",
            new[] { ("Shrimp (raw)", 400m), ("Cauliflower", 350m), ("Garlic", 15m), ("Olive Oil", 10m) }),
        new("Turkey, Kale & Sweet Potato Hash", MealType.Breakfast,
            "Brown turkey mince with sweet potato and kale.",
            new[] { ("Turkey Breast Mince", 400m), ("Sweet Potato", 300m), ("Kale", 100m), ("Onion", 60m) }),
        new("Black Bean & Avocado Bowl", MealType.Lunch,
            "Combine black beans with tomato, avocado and a squeeze of lime.",
            new[] { ("Black Beans (cooked)", 300m), ("Tomato", 150m), ("Avocado", 100m), ("Bell Pepper (red)", 100m) }),
        new("Chicken, Brussels Sprouts & Quinoa", MealType.Dinner,
            "Roast chicken thighs with Brussels sprouts, serve with quinoa.",
            new[] { ("Chicken Thigh (skinless, raw)", 400m), ("Brussels Sprouts", 250m), ("Quinoa (cooked)", 250m), ("Olive Oil", 10m) })
    };
}
