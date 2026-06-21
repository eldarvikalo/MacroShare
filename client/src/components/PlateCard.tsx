import type { PersonPortion } from "../types";
import { fallbackColor, grams, initials, round } from "../utils";

interface Props {
  portion: PersonPortion;
  index: number;
}

function MacroStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
      <div className="text-lg font-bold text-slate-800">
        {round(value, 1)}
        <span className="ml-0.5 text-xs font-medium text-slate-400">{unit}</span>
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}

/** A single person's plate: exact grams + macro yield. Rendered once per selected user. */
export function PlateCard({ portion, index }: Props) {
  const color = portion.avatarColor ?? fallbackColor(index);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: `${color}14` }}>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {initials(portion.name)}
        </span>
        <div className="flex-1">
          <div className="text-base font-bold text-slate-800">{portion.name}</div>
          <div className="text-xs font-medium text-slate-500">
            {round(portion.ratioPercent, 1)}% of the meal
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold" style={{ color }}>
            {grams(portion.portionGrams)}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            on the plate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
        <MacroStat label="Calories" value={portion.calories} unit="kcal" />
        <MacroStat label="Protein" value={portion.protein} unit="g" />
        <MacroStat label="Carbs" value={portion.carbs} unit="g" />
        <MacroStat label="Fat" value={portion.fat} unit="g" />
        <MacroStat label="Sugar" value={portion.sugar} unit="g" />
      </div>
    </div>
  );
}
