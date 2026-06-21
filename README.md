# MacroShare

Cook one meal, split it perfectly across everyone's macro targets.

MacroShare is a diet / meal-tracking / pantry app for a household that cooks the **same meals** but needs **different portion sizes**. The core feature is a dynamic **Smart Portion Splitter** that divides a cooked recipe across any number of household members based on each person's remaining daily calorie need.

Built around a **Household** concept (one household → many users), so it scales natively from 1 to N members.

## Tech stack

- **Backend:** ASP.NET Core 8 Web API, C#, Entity Framework Core
- **Architecture:** Clean Architecture + Repository pattern + CQRS via MediatR, FluentValidation
- **Database:** PostgreSQL (Npgsql)
- **Frontend:** React + TypeScript + Tailwind CSS + Axios (Vite)

## Solution layout

```
MacroShare.sln
├─ src/
│  ├─ MacroShare.Domain          Entities, enums, MealSplitterService (pure domain logic)
│  ├─ MacroShare.Application      DTOs, repository interfaces, MediatR handlers, validation
│  ├─ MacroShare.Infrastructure   EF Core DbContext, configs, repositories, migrations, seeder
│  └─ MacroShare.Api              Controllers, DI wiring, Swagger, CORS
├─ data/ingredients.json          Representative ingredient dataset (seeder scales to 10k+)
└─ client/                        React + TS + Tailwind frontend
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- PostgreSQL 14+ (or Docker)

## 1. Start PostgreSQL

With Docker:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with db `macroshare`, user `postgres`, password `postgres` — matching the default connection string in `src/MacroShare.Api/appsettings.json`. Edit that connection string if your setup differs.

## 2. Run the API

```bash
dotnet restore
dotnet run --project src/MacroShare.Api
```

On first startup the app automatically:

1. Applies EF Core migrations.
2. Seeds ingredients from `data/ingredients.json` (idempotent, batched).
3. Seeds a starter household ("The MacroShare Home") with two users — **Alex** (male, very active, high protein) and **Sam** (female, lightly active, gradual fat loss) — plus a stocked pantry and several recipes.

API runs at `http://localhost:5080`, Swagger UI at `http://localhost:5080/swagger`.

> EF tooling: `dotnet tool install --global dotnet-ef --version 8.0.10`. To add a migration:
> ```bash
> dotnet ef migrations add <Name> \
>   --project src/MacroShare.Infrastructure \
>   --startup-project src/MacroShare.Api \
>   --output-dir Persistence/Migrations
> ```

## Optional: bulk-import Open Food Facts data

To load tens of thousands of real foods, drop the Open Food Facts CSV export
(`en.openfoodfacts.org.products.csv`, tab-separated) in the repo root and run the one-time import:

```bash
dotnet run --project src/MacroShare.Api -- import-off
# optional overrides: -- import-off /path/to/file.csv 50000
```

The importer (`OpenFoodFactsImporter`) streams the multi-GB file, keeps only rows with a usable name
and complete, in-range macros, ranks them by Open Food Facts `completeness` (bounded min-heap so memory
stays proportional to the cap), de-duplicates by name, skips foods already present, and inserts up to
`OpenFoodFacts:MaxItems` (default 50,000). A full 4.5M-row export imports in ~30s and yields ~40k foods.

## 3. Run the frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`. The API base URL and default household id live in `client/.env`.

## Key endpoints

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `POST` | `/api/meals/split` | Split a recipe across selected members. Body: `{ recipeId, userIds: number[], date? }` |
| `GET`  | `/api/households/{id}/members` | List household members (scales to N) |
| `GET`  | `/api/households/{id}/meal-suggestions?type=Dinner` | Up to 50 pantry-matched (≥80%), protein-prioritized recipes |
| `GET`  | `/api/recipes` | All recipes with ingredients |
| `POST` | `/api/ingredients/custom` | Add a custom/local ingredient |

## How the Smart Portion Splitter works

`MealSplitterService` (in `MacroShare.Domain`) is pure, DB-free logic:

1. Aggregate the recipe's total grams + macros from its raw ingredients.
2. For each participant, compute **demand** = `TargetCalories − caloriesConsumedToday` (floored at a minimum).
3. Each person's ratio = `demand_i / Σ demand`. Ratios always sum to 100%.
4. Scale grams and every macro by that ratio.

Because it iterates over a participant list, it returns 1, 2, or N plates dynamically — the frontend renders one **Plate Card** per selected member.

## Frontend features

- **Cook for Us:** pick a recipe, toggle which members are eating (avatar multi-select), and see exact gram portions + macros per person.
- **Pantry Suggestions:** browse pantry-matched, protein-first recipe ideas per meal type.
- **Settings:** view members' BMR/TDEE/targets, add custom ingredients, and an "Invite / Add Member" placeholder for future household growth.
