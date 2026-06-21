using MacroShare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MacroShare.Infrastructure.Persistence.Configurations;

public class HouseholdConfiguration : IEntityTypeConfiguration<Household>
{
    public void Configure(EntityTypeBuilder<Household> builder)
    {
        builder.ToTable("Households");
        builder.HasKey(h => h.Id);

        builder.Property(h => h.Name).IsRequired().HasMaxLength(200);

        // One Household -> many AppUsers (the N-user relationship).
        builder.HasMany(h => h.Members)
            .WithOne(u => u.Household!)
            .HasForeignKey(u => u.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        // One Household -> one shared pantry.
        builder.HasOne(h => h.Pantry)
            .WithOne(p => p.Household!)
            .HasForeignKey<HouseholdPantry>(p => p.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(h => h.MealLogs)
            .WithOne(m => m.Household!)
            .HasForeignKey(m => m.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
