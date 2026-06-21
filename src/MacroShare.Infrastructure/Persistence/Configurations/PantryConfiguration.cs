using MacroShare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MacroShare.Infrastructure.Persistence.Configurations;

public class HouseholdPantryConfiguration : IEntityTypeConfiguration<HouseholdPantry>
{
    public void Configure(EntityTypeBuilder<HouseholdPantry> builder)
    {
        builder.ToTable("HouseholdPantries");
        builder.HasKey(p => p.Id);

        builder.HasIndex(p => p.HouseholdId).IsUnique();

        builder.HasMany(p => p.Items)
            .WithOne(i => i.Pantry!)
            .HasForeignKey(i => i.PantryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PantryItemConfiguration : IEntityTypeConfiguration<PantryItem>
{
    public void Configure(EntityTypeBuilder<PantryItem> builder)
    {
        builder.ToTable("PantryItems");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.QuantityGrams).HasPrecision(9, 2);

        builder.HasOne(i => i.Ingredient)
            .WithMany()
            .HasForeignKey(i => i.IngredientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(i => new { i.PantryId, i.IngredientId }).IsUnique();
    }
}
