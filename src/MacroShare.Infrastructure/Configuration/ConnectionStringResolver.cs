using Microsoft.Extensions.Configuration;
using Npgsql;

namespace MacroShare.Infrastructure.Configuration;

internal static class ConnectionStringResolver
{
    public static string Resolve(IConfiguration configuration)
    {
        var raw = configuration.GetConnectionString("DefaultConnection")
            ?? configuration["DATABASE_URL"];

        if (string.IsNullOrWhiteSpace(raw))
        {
            throw new InvalidOperationException(
                "Database connection string is not configured. Set ConnectionStrings__DefaultConnection or DATABASE_URL.");
        }

        raw = raw.Trim().Trim('"', '\'');

        return IsPostgresUri(raw) ? FromPostgresUri(raw) : raw;
    }

    private static bool IsPostgresUri(string value) =>
        value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        || value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

    private static string FromPostgresUri(string uriString)
    {
        var normalized = uriString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            ? "postgresql://" + uriString["postgres://".Length..]
            : uriString;

        var uri = new Uri(normalized);
        var userInfo = uri.UserInfo.Split(':', 2);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
            SslMode = SslMode.Prefer,
        };

        if (string.IsNullOrEmpty(uri.Query))
            return builder.ConnectionString;

        foreach (var part in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var pair = part.Split('=', 2);
            if (pair.Length != 2)
                continue;

            if (pair[0].Equals("sslmode", StringComparison.OrdinalIgnoreCase)
                && Enum.TryParse<SslMode>(pair[1], ignoreCase: true, out var sslMode))
            {
                builder.SslMode = sslMode;
            }
        }

        return builder.ConnectionString;
    }
}
