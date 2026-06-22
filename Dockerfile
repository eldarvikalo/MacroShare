FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY MacroShare.sln ./
COPY src/MacroShare.Domain/MacroShare.Domain.csproj src/MacroShare.Domain/
COPY src/MacroShare.Application/MacroShare.Application.csproj src/MacroShare.Application/
COPY src/MacroShare.Infrastructure/MacroShare.Infrastructure.csproj src/MacroShare.Infrastructure/
COPY src/MacroShare.Api/MacroShare.Api.csproj src/MacroShare.Api/
RUN dotnet restore src/MacroShare.Api/MacroShare.Api.csproj

COPY src/ src/
COPY data/ data/
RUN dotnet publish src/MacroShare.Api/MacroShare.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY --from=build /src/data ./data

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "MacroShare.Api.dll"]
