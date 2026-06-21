import { useState } from "react";
import { AccountPanel } from "./components/AccountPanel";
import { LoginPage } from "./components/LoginPage";
import { MealPlanner } from "./components/MealPlanner";
import { RecipeBuilder } from "./components/RecipeBuilder";
import { SettingsPanel } from "./components/SettingsPanel";
import { SuggestionsPanel } from "./components/SuggestionsPanel";
import { AuthProvider, useAuth } from "./auth/AuthContext";

type Tab = "planner" | "builder" | "suggestions" | "account" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "planner", label: "Cook for Us" },
  { id: "builder", label: "Build a Recipe" },
  { id: "suggestions", label: "Pantry Suggestions" },
  { id: "account", label: "Account" },
  { id: "settings", label: "Settings" }
];

function AppShell() {
  const { user, profile, isLoading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("planner");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading MacroShare…
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 font-sans">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Macro<span className="text-indigo-600">Share</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {profile?.name ?? user.name}. Track your cut and split meals together.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <nav className="flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  tab === t.id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Sign out ({user.email})
          </button>
        </div>
      </header>

      <main>
        {tab === "planner" && <MealPlanner />}
        {tab === "builder" && <RecipeBuilder />}
        {tab === "suggestions" && <SuggestionsPanel />}
        {tab === "account" && <AccountPanel />}
        {tab === "settings" && <SettingsPanel />}
      </main>

      <footer className="mt-12 text-center text-xs text-slate-400">
        MacroShare · Shared household #{user.householdId}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
