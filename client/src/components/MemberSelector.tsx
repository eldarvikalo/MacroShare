import type { HouseholdMember } from "../types";
import { fallbackColor, initials } from "../utils";

interface Props {
  members: HouseholdMember[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

/**
 * Multi-select avatar toggle: pick WHO is eating this meal. Works for any number of
 * household members (1, 2, or N).
 */
export function MemberSelector({ members, selectedIds, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {members.map((member, idx) => {
        const selected = selectedIds.includes(member.id);
        const color = member.avatarColor ?? fallbackColor(idx);

        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onToggle(member.id)}
            aria-pressed={selected}
            className={`group flex items-center gap-3 rounded-2xl border px-3 py-2 transition-all ${
              selected
                ? "border-transparent bg-white shadow-md ring-2 ring-offset-2"
                : "border-slate-200 bg-white/60 hover:bg-white hover:shadow-sm"
            }`}
            style={selected ? ({ "--tw-ring-color": color } as React.CSSProperties) : undefined}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: color, opacity: selected ? 1 : 0.55 }}
            >
              {initials(member.name)}
            </span>
            <span className="pr-1 text-left">
              <span className="block text-sm font-semibold text-slate-800">{member.name}</span>
              <span className="block text-xs text-slate-500">
                {Math.round(member.targetCalories)} kcal target
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
