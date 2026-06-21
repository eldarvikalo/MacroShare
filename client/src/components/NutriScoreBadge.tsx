const GRADE_COLORS: Record<string, string> = {
  A: "#038141",
  B: "#85bb2f",
  C: "#fecb02",
  D: "#ee8100",
  E: "#e63e11"
};

interface Props {
  grade: string;
  size?: "sm" | "md";
}

/** Official-style Nutri-Score A-E letter badge (computed from recipe macros). */
export function NutriScoreBadge({ grade, size = "sm" }: Props) {
  const g = (grade ?? "?").toUpperCase();
  const color = GRADE_COLORS[g] ?? "#94a3b8";
  const dim = size === "md" ? "h-8 w-8 text-base" : "h-6 w-6 text-xs";

  return (
    <span
      title={`Nutri-Score ${g} (estimated from macros)`}
      className={`inline-flex ${dim} items-center justify-center rounded-md font-extrabold text-white`}
      style={{ backgroundColor: color }}
    >
      {g}
    </span>
  );
}
