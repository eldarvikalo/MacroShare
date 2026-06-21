using MacroShare.Domain.Enums;

namespace MacroShare.Domain.Entities;

public class Recipe
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public MealType MealType { get; set; }
    public string? Instructions { get; set; }

    public ICollection<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();
}
