using MacroShare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MacroShare.Infrastructure.Persistence.Configurations;

public class IngredientConfiguration : IEntityTypeConfiguration<Ingredient>
{
    public void Configure(EntityTypeBuilder<Ingredient> builder)
    {
        builder.ToTable("Ingredients");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Name).IsRequired().HasMaxLength(200);
        builder.HasIndex(i => i.Name).IsUnique();

        builder.Property(i => i.CaloriesPer100g).HasPrecision(8, 2);
        builder.Property(i => i.ProteinPer100g).HasPrecision(8, 2);
        builder.Property(i => i.CarbsPer100g).HasPrecision(8, 2);
        builder.Property(i => i.FatPer100g).HasPrecision(8, 2);
        builder.Property(i => i.SugarPer100g).HasPrecision(8, 2);
    }
}
