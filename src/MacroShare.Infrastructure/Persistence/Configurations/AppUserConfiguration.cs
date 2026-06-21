using MacroShare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MacroShare.Infrastructure.Persistence.Configurations;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("AppUsers");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Name).IsRequired().HasMaxLength(120);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.Sex).HasConversion<int>();

        builder.Property(u => u.HeightCm).HasPrecision(6, 2);
        builder.Property(u => u.WeightKg).HasPrecision(6, 2);
        builder.Property(u => u.Bmr).HasPrecision(8, 2);
        builder.Property(u => u.ActivityMultiplier).HasPrecision(5, 3);
        builder.Property(u => u.TargetCalories).HasPrecision(8, 2);
        builder.Property(u => u.TargetProtein).HasPrecision(8, 2);
        builder.Property(u => u.AvatarColor).HasMaxLength(20);

        // Tdee is a computed get-only property; explicitly ignore for clarity.
        builder.Ignore(u => u.Tdee);

        builder.HasIndex(u => u.HouseholdId);
        builder.HasIndex(u => u.Email).IsUnique();
    }
}
