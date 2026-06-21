using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MacroShare.Infrastructure.Persistence;

/// <summary>
/// Used only by EF Core tooling (e.g. `dotnet ef migrations add`) so the design-time
/// commands never need to boot the API host. The connection string here is not used at
/// runtime - the real one comes from configuration via AddInfrastructure.
/// </summary>
public class MacroShareDbContextFactory : IDesignTimeDbContextFactory<MacroShareDbContext>
{
    public MacroShareDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("MACROSHARE_DESIGN_CONNECTION")
            ?? "Host=localhost;Port=5432;Database=macroshare;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<MacroShareDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new MacroShareDbContext(options);
    }
}
