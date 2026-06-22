"use client"

import { LayoutDashboard, ChefHat, Package, User, Settings } from "lucide-react"
import { useApp, type TabId } from "./app-context"
import { cn } from "@/lib/utils"

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "cook", label: "Cook", icon: ChefHat },
  { id: "pantry", label: "Pantry", icon: Package },
  { id: "account", label: "Account", icon: User },
  { id: "settings", label: "More", icon: Settings },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl safe-bottom">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors active:scale-95",
                active ? "text-primary" : "text-slate-500"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
              <span className={cn("text-[10px] font-semibold", active && "text-primary")}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
