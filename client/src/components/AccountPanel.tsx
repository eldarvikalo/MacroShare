import { useEffect, useMemo, useState } from "react";
import { toErrorMessage } from "../api/client";
import {
  getBodyCompositionHistory,
  getDailyProgress,
  getHouseholdMembers,
  logBodyComposition,
  updateProfile
} from "../api/services";
import { useAuth } from "../auth/AuthContext";
import type { BodyCompositionEntry, DailyProgress, HouseholdMember } from "../types";
import { fallbackColor, initials, round } from "../utils";

const EMPTY_METRIC = {
  measuredAt: new Date().toISOString().slice(0, 16),
  weightKg: "",
  bmi: "",
  bodyFatPercent: "",
  bodyScore: "",
  bmr: "",
  muscleMassKg: "",
  fatMassKg: "",
  bodyWaterPercent: "",
  visceralFatRating: "",
  standardWeightKg: "",
  weightControlKg: "",
  fatControlKg: "",
  bodyTypeLabel: "",
  notes: "",
  applyToProfile: true,
  recalculateTargets: false
};

function num(val: string): number | null {
  if (!val.trim()) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

function ProgressBar({ label, consumed, target, unit }: { label: string; consumed: number; target: number; unit: string }) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{round(consumed)}/{round(target)}{unit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AccountPanel() {
  const { user, profile, householdId, refreshProfile } = useAuth();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [viewUserId, setViewUserId] = useState<number | null>(user?.userId ?? null);
  const [history, setHistory] = useState<BodyCompositionEntry[]>([]);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [form, setForm] = useState(EMPTY_METRIC);
  const [targets, setTargets] = useState({ calories: "", protein: "" });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeMember = useMemo(
    () => members.find((m) => m.id === viewUserId) ?? null,
    [members, viewUserId]
  );

  async function reload() {
    if (!householdId) return;
    setLoading(true);
    try {
      const [m, h, p] = await Promise.all([
        getHouseholdMembers(householdId),
        getBodyCompositionHistory(viewUserId ?? undefined, 30),
        getDailyProgress()
      ]);
      setMembers(m);
      setHistory(h);
      setProgress(p);
      if (!viewUserId && m.length > 0) setViewUserId(user?.userId ?? m[0].id);
      setError(null);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [householdId, viewUserId]);

  useEffect(() => {
    if (profile) {
      setTargets({
        calories: String(profile.targetCalories),
        protein: String(profile.targetProtein)
      });
      setForm((prev) => ({
        ...prev,
        weightKg: profile.weightKg ? String(profile.weightKg) : prev.weightKg,
        bmr: profile.bmr ? String(profile.bmr) : prev.bmr
      }));
    }
  }, [profile]);

  async function saveMetric(e: React.FormEvent) {
    e.preventDefault();
    if (!num(form.weightKg)) return;
    setSaving(true);
    setFeedback(null);
    setError(null);
    try {
      await logBodyComposition({
        measuredAt: new Date(form.measuredAt).toISOString(),
        weightKg: num(form.weightKg)!,
        bmi: num(form.bmi),
        bodyFatPercent: num(form.bodyFatPercent),
        bodyScore: num(form.bodyScore) !== null ? Math.round(num(form.bodyScore)!) : null,
        bmr: num(form.bmr),
        muscleMassKg: num(form.muscleMassKg),
        fatMassKg: num(form.fatMassKg),
        bodyWaterPercent: num(form.bodyWaterPercent),
        visceralFatRating: num(form.visceralFatRating) !== null ? Math.round(num(form.visceralFatRating)!) : null,
        standardWeightKg: num(form.standardWeightKg),
        weightControlKg: num(form.weightControlKg),
        fatControlKg: num(form.fatControlKg),
        bodyTypeLabel: form.bodyTypeLabel || null,
        notes: form.notes || null,
        applyToProfile: form.applyToProfile,
        recalculateTargets: form.recalculateTargets
      });
      setFeedback("Scale reading saved.");
      await reload();
      await refreshProfile();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveTargets(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        targetCalories: num(targets.calories),
        targetProtein: num(targets.protein)
      });
      setFeedback("Targets updated.");
      await refreshProfile();
      await reload();
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const baseline = history[history.length - 1];
  const latest = history[0];
  const weightDelta = baseline && latest ? latest.weightKg - baseline.weightKg : null;

  if (loading && members.length === 0) {
    return <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">Loading account…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Today's progress</h2>
        <p className="mb-4 text-sm text-slate-500">Macros logged from meals split under Cook for Us.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {progress.map((p, idx) => (
            <div key={p.userId} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: p.avatarColor ?? fallbackColor(idx) }}
                >
                  {initials(p.name)}
                </span>
                <span className="font-semibold text-slate-800">{p.name}</span>
              </div>
              <div className="space-y-3">
                <ProgressBar label="Calories" consumed={p.consumedCalories} target={p.targetCalories} unit=" kcal" />
                <ProgressBar label="Protein" consumed={p.consumedProtein} target={p.targetProtein} unit="g" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-800">Body progress</h2>
            <select
              value={viewUserId ?? ""}
              onChange={(e) => setViewUserId(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {activeMember && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Weight", `${round(activeMember.weightKg)} kg`],
                ["BMR", `${round(activeMember.bmr)}`],
                ["Target", `${round(activeMember.targetCalories)} kcal`],
                ["Protein", `${round(activeMember.targetProtein)}g`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-indigo-50 p-3 text-center">
                  <div className="text-sm font-bold text-indigo-700">{value}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-400">{label}</div>
                </div>
              ))}
            </div>
          )}

          {latest && (
            <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              Latest: {round(latest.weightKg)} kg
              {latest.bodyFatPercent != null && ` · ${round(latest.bodyFatPercent, 1)}% body fat`}
              {weightDelta != null && (
                <span className={weightDelta <= 0 ? " text-emerald-700" : " text-amber-700"}>
                  {" "}({weightDelta > 0 ? "+" : ""}{round(weightDelta, 1)} kg since baseline)
                </span>
              )}
            </div>
          )}

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {history.length === 0 && (
              <p className="text-sm text-slate-400">No scale readings yet.</p>
            )}
            {history.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {round(entry.weightKg)} kg
                    {entry.bodyFatPercent != null && ` · ${round(entry.bodyFatPercent, 1)}% fat`}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(entry.measuredAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {entry.bmr != null && `BMR ${round(entry.bmr)} · `}
                  {entry.bodyTypeLabel && `${entry.bodyTypeLabel} · `}
                  {entry.weightControlKg != null && `Goal ${round(entry.weightControlKg, 1)} kg`}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-bold text-slate-800">Log scale reading</h2>
          <p className="mb-4 text-sm text-slate-500">Import your smart-scale data day by day.</p>

          <form onSubmit={saveMetric} className="space-y-3">
            <input
              type="datetime-local"
              value={form.measuredAt}
              onChange={(e) => setForm({ ...form, measuredAt: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["weightKg", "Weight (kg)", true],
                  ["bodyFatPercent", "Body fat %", false],
                  ["bmi", "BMI", false],
                  ["bmr", "BMR (kcal)", false],
                  ["muscleMassKg", "Muscle mass (kg)", false],
                  ["fatMassKg", "Fat mass (kg)", false]
                ] as const
              ).map(([key, label, req]) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                    required={req}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {showAdvanced ? "Hide advanced fields" : "Show advanced fields (water, visceral fat, goals…)"}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                {[
                  ["bodyScore", "Body score"],
                  ["bodyWaterPercent", "Body water %"],
                  ["visceralFatRating", "Visceral fat"],
                  ["standardWeightKg", "Standard weight (kg)"],
                  ["weightControlKg", "Weight control (kg)"],
                  ["fatControlKg", "Fat control (kg)"],
                  ["bodyTypeLabel", "Body type label"]
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                    <input
                      type={key === "bodyTypeLabel" ? "text" : "number"}
                      step="0.1"
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={form.applyToProfile}
                onChange={(e) => setForm({ ...form, applyToProfile: e.target.checked })}
              />
              Update my profile weight & BMR from this reading
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={form.recalculateTargets}
                onChange={(e) => setForm({ ...form, recalculateTargets: e.target.checked })}
              />
              Recalculate calorie & protein targets (15% deficit)
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save reading"}
            </button>
          </form>

          <form onSubmit={saveTargets} className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Adjust daily targets</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={targets.calories}
                onChange={(e) => setTargets({ ...targets, calories: e.target.value })}
                placeholder="Target calories"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <input
                type="number"
                value={targets.protein}
                onChange={(e) => setTargets({ ...targets, protein: e.target.value })}
                placeholder="Target protein (g)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-3 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
            >
              Update targets
            </button>
          </form>
        </section>
      </div>

      {feedback && <p className="text-sm font-medium text-emerald-600">{feedback}</p>}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
