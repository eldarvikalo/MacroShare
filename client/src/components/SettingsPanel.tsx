import { useEffect, useState } from "react";
import { toErrorMessage } from "../api/client";
import { addCustomIngredient, getHouseholdMembers } from "../api/services";
import { useAuth } from "../auth/AuthContext";
import type { AddCustomIngredientRequest, HouseholdMember } from "../types";
import { fallbackColor, initials, round } from "../utils";

const EMPTY_INGREDIENT: AddCustomIngredientRequest = {
  name: "",
  caloriesPer100g: 0,
  proteinPer100g: 0,
  carbsPer100g: 0,
  fatPer100g: 0,
  sugarPer100g: 0
};

export function SettingsPanel() {
  const { householdId } = useAuth();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [form, setForm] = useState<AddCustomIngredientRequest>(EMPTY_INGREDIENT);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!householdId) return;
    getHouseholdMembers(householdId)
      .then(setMembers)
      .catch((e) => setError(toErrorMessage(e)));
  }, [householdId]);

  function update<K extends keyof AddCustomIngredientRequest>(
    key: K,
    value: AddCustomIngredientRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      const { id } = await addCustomIngredient({ ...form, name: form.name.trim() });
      setFeedback(`Added "${form.name.trim()}" (id ${id}).`);
      setForm(EMPTY_INGREDIENT);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const numberFields: Array<[keyof AddCustomIngredientRequest, string]> = [
    ["caloriesPer100g", "Calories / 100g"],
    ["proteinPer100g", "Protein / 100g"],
    ["carbsPer100g", "Carbs / 100g"],
    ["fatPer100g", "Fat / 100g"],
    ["sugarPer100g", "Sugar / 100g"]
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Household members</h2>
          <button
            type="button"
            onClick={() => setFeedback("Inviting members is coming soon.")}
            className="rounded-xl border border-dashed border-indigo-300 px-3 py-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            + Invite / Add Member
          </button>
        </div>
        <ul className="space-y-3">
          {members.map((m, idx) => {
            const color = m.avatarColor ?? fallbackColor(idx);
            return (
              <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {initials(m.name)}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{m.name}</div>
                  <div className="text-xs text-slate-500">
                    {round(m.weightKg)} kg · BMR {round(m.bmr)} · TDEE {round(m.tdee)} · Target{" "}
                    {round(m.targetCalories)} kcal / {round(m.targetProtein)}g protein
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Add a custom ingredient</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Grandma's chili sauce"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {numberFields.map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={form[key] as number}
                  onChange={(e) => update(key, Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add ingredient"}
          </button>
        </form>

        {feedback && <p className="mt-3 text-sm font-medium text-emerald-600">{feedback}</p>}
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      </section>
    </div>
  );
}
