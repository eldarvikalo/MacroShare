using MacroShare.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MacroShare.Infrastructure.Persistence.Configurations;

public class BodyCompositionEntryConfiguration : IEntityTypeConfiguration<BodyCompositionEntry>
{
    public void Configure(EntityTypeBuilder<BodyCompositionEntry> builder)
    {
        builder.ToTable("BodyCompositionEntries");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.WeightKg).HasPrecision(6, 2);
        builder.Property(e => e.Bmi).HasPrecision(5, 2);
        builder.Property(e => e.BodyFatPercent).HasPrecision(5, 2);
        builder.Property(e => e.BodyWaterKg).HasPrecision(6, 2);
        builder.Property(e => e.BodyWaterPercent).HasPrecision(5, 2);
        builder.Property(e => e.FatMassKg).HasPrecision(6, 2);
        builder.Property(e => e.BoneMineralKg).HasPrecision(6, 2);
        builder.Property(e => e.BoneMineralPercent).HasPrecision(5, 2);
        builder.Property(e => e.ProteinMassKg).HasPrecision(6, 2);
        builder.Property(e => e.ProteinPercent).HasPrecision(5, 2);
        builder.Property(e => e.MuscleMassKg).HasPrecision(6, 2);
        builder.Property(e => e.MusclePercent).HasPrecision(5, 2);
        builder.Property(e => e.SkeletalMuscleKg).HasPrecision(6, 2);
        builder.Property(e => e.Bmr).HasPrecision(8, 2);
        builder.Property(e => e.WaistHipRatio).HasPrecision(4, 2);
        builder.Property(e => e.FatFreeBodyWeightKg).HasPrecision(6, 2);
        builder.Property(e => e.StandardWeightKg).HasPrecision(6, 2);
        builder.Property(e => e.WeightControlKg).HasPrecision(6, 2);
        builder.Property(e => e.FatControlKg).HasPrecision(6, 2);
        builder.Property(e => e.MuscleControlKg).HasPrecision(6, 2);
        builder.Property(e => e.BodyTypeLabel).HasMaxLength(40);
        builder.Property(e => e.Notes).HasMaxLength(500);

        builder.HasIndex(e => new { e.AppUserId, e.MeasuredAt });

        builder.HasOne(e => e.AppUser)
            .WithMany(u => u.BodyCompositionEntries)
            .HasForeignKey(e => e.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
