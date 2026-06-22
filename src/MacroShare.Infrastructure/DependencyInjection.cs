using MacroShare.Application.Common.Interfaces;
using MacroShare.Infrastructure.Configuration;
using MacroShare.Infrastructure.Persistence;
using MacroShare.Infrastructure.Repositories;
using MacroShare.Infrastructure.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MacroShare.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = ConnectionStringResolver.Resolve(configuration);

        services.AddDbContext<MacroShareDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<MacroShareDbContext>());

        services.AddScoped<IHouseholdRepository, HouseholdRepository>();
        services.AddScoped<IRecipeRepository, RecipeRepository>();
        services.AddScoped<IPantryRepository, PantryRepository>();
        services.AddScoped<IIngredientRepository, IngredientRepository>();
        services.AddScoped<IMealLogRepository, MealLogRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBodyCompositionRepository, BodyCompositionRepository>();
        services.AddSingleton<IPasswordHasher, Security.PasswordHasher>();
        services.AddSingleton<ITokenGenerator, Security.JwtTokenGenerator>();

        services.AddScoped<IngredientSeeder>();
        services.AddScoped<DbInitializer>();
        services.AddScoped<OpenFoodFactsImporter>();

        return services;
    }
}
