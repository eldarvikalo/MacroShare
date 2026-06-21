"use client"

import { useState } from "react"
import { ScreenHeader, SectionTitle } from "@/components/screen-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/components/app-context"
import { useToast } from "@/components/toast"
import { HOUSEHOLD_NAME } from "@/lib/members"
import {
  Settings as SettingsIcon,
  Bell,
  Scale,
  Utensils,
  Moon,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react"

export function SettingsScreen() {
  const { user, logout } = useApp()
  const { toast } = useToast()
  const [toggles, setToggles] = useState({
    mealReminders: true,
    scaleSync: true,
    weeklyReport: false,
    darkMode: true,
  })

  function flip(key: keyof typeof toggles) {
    setToggles((t) => ({ ...t, [key]: !t[key] }))
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-4">
      <ScreenHeader subtitle="Settings" />
      <SectionTitle icon={<SettingsIcon className="size-5 text-primary" />} title="Settings" subtitle={HOUSEHOLD_NAME} />

      <Card className="p-2">
        <SectionLabel>Notifications</SectionLabel>
        <ToggleRow
          icon={<Bell className="size-4" />}
          title="Meal reminders"
          desc="Get nudged at meal times"
          on={toggles.mealReminders}
          onClick={() => flip("mealReminders")}
        />
        <ToggleRow
          icon={<Utensils className="size-4" />}
          title="Weekly report"
          desc="Sunday recap of household macros"
          on={toggles.weeklyReport}
          onClick={() => flip("weeklyReport")}
        />
      </Card>

      <Card className="p-2">
        <SectionLabel>Devices</SectionLabel>
        <ToggleRow
          icon={<Scale className="size-4" />}
          title="Smart scale sync"
          desc="Auto-import weight readings"
          on={toggles.scaleSync}
          onClick={() => flip("scaleSync")}
        />
        <ToggleRow
          icon={<Moon className="size-4" />}
          title="Dark mode"
          desc="Always on for MacroShare"
          on={toggles.darkMode}
          onClick={() => flip("darkMode")}
        />
      </Card>

      <Card className="p-2">
        <SectionLabel>Account</SectionLabel>
        <LinkRow
          icon={<ShieldCheck className="size-4" />}
          title="Privacy & data"
          onClick={() => toast("Privacy settings coming soon")}
        />
        <LinkRow
          icon={<Utensils className="size-4" />}
          title="Dietary preferences"
          onClick={() => toast("Dietary preferences coming soon")}
        />
      </Card>

      <Card className="p-4">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        <Separator className="my-3" />
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </Card>

      <p className="text-center text-xs text-muted-foreground">MacroShare v1.0 · {HOUSEHOLD_NAME}</p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</p>
}

function ToggleRow({
  icon,
  title,
  desc,
  on,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-secondary/50">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-secondary"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  )
}

function LinkRow({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-secondary/50">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{title}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  )
}
