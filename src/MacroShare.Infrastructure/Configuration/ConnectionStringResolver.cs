using Microsoft.Extensions.Configuration;

namespace MacroShare.Infrastructure.Configuration;

internal static class ConnectionStringResolver
{
    public static string Resolve(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration["DATABASE_URL"];

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "Database connection string is not configured. Set ConnectionStrings__DefaultConnection or DATABASE_URL.");

        connectionString = connectionString.Trim().Trim('"', '\'');

        // Render/Heroku use postgres:// — Npgsql expects postgresql://
        if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
            connectionString = "postgresql://" + connectionString["postgres://".Length..];

        return connectionString;
    }
}
