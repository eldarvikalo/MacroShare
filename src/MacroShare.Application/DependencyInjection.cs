using FluentValidation;
using MacroShare.Application.Common.Behaviors;
using MacroShare.Application.Common.Interfaces;
using MacroShare.Application.Features.Auth.Login;
using MacroShare.Domain.Services;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace MacroShare.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(LoginCommand).Assembly));
        services.AddValidatorsFromAssembly(typeof(LoginCommand).Assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddSingleton<IMealSplitterService, MealSplitterService>();
        return services;
    }
}
