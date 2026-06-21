using System.Reflection;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MacroShare.Infrastructure.Persistence;

public class MacroShareDbContext : DbContext, IUnitOfWork
{
    public MacroShareDbContext(DbContextOptions<MacroShareDbContext> options) : base(options) { }

    public DbSet<Household> Households => Set<Household>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();
    public DbSet<HouseholdPantry> HouseholdPantries => Set<HouseholdPantry>();
    public DbSet<PantryItem> PantryItems => Set<PantryItem>();
    public DbSet<MealLog> MealLogs => Set<MealLog>();
    public DbSet<MealLogEntry> MealLogEntries => Set<MealLogEntry>();
    public DbSet<BodyCompositionEntry> BodyCompositionEntries => Set<BodyCompositionEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
