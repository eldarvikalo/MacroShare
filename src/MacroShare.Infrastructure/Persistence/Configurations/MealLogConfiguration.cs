using MacroShare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MacroShare.Infrastructure.Persistence.Configurations;

public class MealLogConfiguration : IEntityTypeConfiguration<MealLog>
{
    public void Configure(EntityTypeBuilder<MealLog> builder)
    {
        builder.ToTable("MealLogs");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.MealType).HasConversion<int>();

        builder.HasOne(m => m.Recipe)
            .WithMany()
            .HasForeignKey(m => m.RecipeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(m => m.Entries)
            .WithOne(e => e.MealLog!)
            .HasForeignKey(e => e.MealLogId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => new { m.HouseholdId, m.Date });
    }
}

public class MealLogEntryConfiguration : IEntityTypeConfiguration<MealLogEntry>
{
    public void Configure(EntityTypeBuilder<MealLogEntry> builder)
    {
        builder.ToTable("MealLogEntries");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.PortionGrams).HasPrecision(9, 2);
        builder.Property(e => e.Calories).HasPrecision(9, 2);
        builder.Property(e => e.Protein).HasPrecision(9, 2);
        builder.Property(e => e.Carbs).HasPrecision(9, 2);
        builder.Property(e => e.Fat).HasPrecision(9, 2);
        builder.Property(e => e.Sugar).HasPrecision(9, 2);

        builder.HasOne(e => e.AppUser)
            .WithMany()
            .HasForeignKey(e => e.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
