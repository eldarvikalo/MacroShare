using System.Text;
using System.Text.Json.Serialization;
using MacroShare.Api.Middleware;
using MacroShare.Api.Services;
using MacroShare.Application;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Infrastructure;
using MacroShare.Infrastructure.Seeding;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicy = "MacroShareClient";

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = signingKey,
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:5173" })
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

// One-time CLI data import: `dotnet run --project src/MacroShare.Api -- import-off [path] [maxItems]`
if (args.Length > 0 && string.Equals(args[0], "import-off", StringComparison.OrdinalIgnoreCase))
{
    await RunOpenFoodFactsImportAsync(app, args);
    return;
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));
app.MapGet("/", () => Results.Ok(new { service = "MacroShare.Api", status = "ok" }));

await InitializeDatabaseAsync(app);

app.Run();

static async Task RunOpenFoodFactsImportAsync(WebApplication app, string[] args)
{
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;

    var db = sp.GetRequiredService<MacroShare.Infrastructure.Persistence.MacroShareDbContext>();
    await db.Database.MigrateAsync();

    var path = args.Length > 1 && !string.IsNullOrWhiteSpace(args[1])
        ? args[1]
        : app.Configuration["OpenFoodFacts:FilePath"]
            ?? Path.Combine(app.Environment.ContentRootPath, "..", "..", "en.openfoodfacts.org.products.csv");

    path = Path.IsPathRooted(path)
        ? path
        : Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, path));

    var maxItems = args.Length > 2 && int.TryParse(args[2], out var m)
        ? m
        : app.Configuration.GetValue("OpenFoodFacts:MaxItems", 50_000);

    var importer = sp.GetRequiredService<MacroShare.Infrastructure.Seeding.OpenFoodFactsImporter>();
    var inserted = await importer.ImportAsync(path, maxItems);

    Console.WriteLine($"Open Food Facts import finished. Inserted {inserted} new ingredients from {path}.");
}

static async Task InitializeDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var initializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();

    var configuredPath = app.Configuration["Seeding:IngredientsFilePath"]
        ?? Path.Combine("..", "..", "data", "ingredients.json");

    var fullPath = Path.IsPathRooted(configuredPath)
        ? configuredPath
        : Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, configuredPath));

    await initializer.InitializeAsync(fullPath);
}
