using MacroShare.Application.Common.Exceptions;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Domain.Entities;
using MediatR;

namespace MacroShare.Application.Features.Ingredients.AddCustomIngredient;

public class AddCustomIngredientCommandHandler : IRequestHandler<AddCustomIngredientCommand, int>
{
    private readonly IIngredientRepository _ingredients;
    private readonly IUnitOfWork _unitOfWork;

    public AddCustomIngredientCommandHandler(IIngredientRepository ingredients, IUnitOfWork unitOfWork)
    {
        _ingredients = ingredients;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(AddCustomIngredientCommand request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();

        if (await _ingredients.ExistsByNameAsync(name, cancellationToken))
            throw new ConflictException($"An ingredient named '{name}' already exists.");

        var ingredient = new Ingredient
        {
            Name = name,
            CaloriesPer100g = request.CaloriesPer100g,
            ProteinPer100g = request.ProteinPer100g,
            CarbsPer100g = request.CarbsPer100g,
            FatPer100g = request.FatPer100g,
            SugarPer100g = request.SugarPer100g,
            IsCustom = true
        };

        await _ingredients.AddAsync(ingredient, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ingredient.Id;
    }
}
