using MacroShare.Domain.Entities;
using MacroShare.Domain.Services;
using Xunit;

namespace MacroShare.Domain.Tests;

public class MealSplitterServiceTests
{
    private readonly MealSplitterService _sut = new();

    // 500g chicken + 200g rice => totals are easy to reason about.
    private static Recipe BuildRecipe() => new()
    {
        Id = 1,
        Name = "Chicken & Rice",
        Ingredients = new List<RecipeIngredient>
        {
            new()
            {
                IngredientId = 1,
                QuantityGrams = 500m,
                Ingredient = new Ingredient
                {
                    Id = 1, Name = "Chicken",
                    CaloriesPer100g = 120m, ProteinPer100g = 22m,
                    CarbsPer100g = 0m, FatPer100g = 2m, SugarPer100g = 0m
                }
            },
            new()
            {
                IngredientId = 2,
                QuantityGrams = 200m,
                Ingredient = new Ingredient
                {
                    Id = 2, Name = "Rice",
                    CaloriesPer100g = 130m, ProteinPer100g = 3m,
                    CarbsPer100g = 28m, FatPer100g = 0m, SugarPer100g = 0m
                }
            }
        }
    };

    private static AppUser User(int id, decimal target) => new()
    {
        Id = id, Name = $"User{id}", HouseholdId = 1, TargetCalories = target
    };

    [Fact]
    public void Aggregates_total_grams_and_calories()
    {
        var result = _sut.Split(BuildRecipe(), new[] { User(1, 2000m) });

        // 700g total; calories = 5*120 + 2*130 = 600 + 260 = 860
        Assert.Equal(700m, result.TotalMeal.TotalGrams);
        Assert.Equal(860m, result.TotalMeal.Calories);
    }

    [Fact]
    public void Two_users_split_proportionally_to_target_calories()
    {
        // 3000 vs 1500 => 2:1 split.
        var result = _sut.Split(BuildRecipe(), new[] { User(1, 3000m), User(2, 1500m) });

        var a = result.Portions.Single(p => p.UserId == 1);
        var b = result.Portions.Single(p => p.UserId == 2);

        Assert.Equal(66.7m, a.RatioPercent);
        Assert.Equal(33.3m, b.RatioPercent);

        // Grams must add up to the whole meal.
        Assert.Equal(result.TotalMeal.TotalGrams, a.PortionGrams + b.PortionGrams);
    }

    [Fact]
    public void Scales_to_three_users_and_ratios_sum_to_100()
    {
        var result = _sut.Split(
            BuildRecipe(),
            new[] { User(1, 3000m), User(2, 1500m), User(3, 1500m) });

        Assert.Equal(3, result.Portions.Count);
        Assert.Equal(100m, result.Portions.Sum(p => p.RatioPercent));
    }

    [Fact]
    public void Consumed_calories_reduce_a_users_share()
    {
        // Both target 2000, but user 1 already ate 1500 today => user 2 gets the bigger plate.
        var consumed = new Dictionary<int, decimal> { [1] = 1500m };

        var result = _sut.Split(
            BuildRecipe(),
            new[] { User(1, 2000m), User(2, 2000m) },
            consumed);

        var a = result.Portions.Single(p => p.UserId == 1);
        var b = result.Portions.Single(p => p.UserId == 2);

        Assert.True(b.PortionGrams > a.PortionGrams);
    }

    [Fact]
    public void Empty_participants_throws()
    {
        Assert.Throws<ArgumentException>(() => _sut.Split(BuildRecipe(), Array.Empty<AppUser>()));
    }
}
