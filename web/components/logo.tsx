import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-extrabold tracking-tight text-slate-100", className)}>
      Macro<span className="text-indigo-500">Share</span>
    </span>
  )
}
