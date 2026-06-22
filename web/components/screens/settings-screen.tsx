"use client"

import * as React from "react"
import { useAuth } from "@/auth/AuthContext"
import { toErrorMessage } from "@/lib/api/client"
import { addCustomIngredient, getHouseholdMembers } from "@/lib/api/services"
import { householdLabel, memberColor, memberInitial } from "@/lib/helpers"
import type { AddCustomIngredientRequest, HouseholdMember } from "@/lib/types"
import { ScreenHeader, SectionTitle } from "@/components/screen-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/widgets"
import { useToast } from "@/components/toast"
import {
  Settings as SettingsIcon,
  Bell,
  Scale,
  Utensils,
  Moon,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Users,
} from "lucide-react"
import { round } from "@/lib/utils"

const EMPTY_INGREDIENT: AddCustomIngredientRequest = {
  name: "",
  caloriesPer100g: 0,
  proteinPer100g: 0,
  carbsPer100g: 0,
  fatPer100g: 0,
  sugarPer100g: 0,
}

export function SettingsScreen() {
  const { user, householdId, logout } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = React.useState<HouseholdMember[]>([])
  const [form, setForm] = React.useState<AddCustomIngredientRequest>(EMPTY_INGREDIENT)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [toggles, setToggles] = React.useState({
    mealReminders: true,
    scaleSync: true,
    weeklyReport: false,
    darkMode: true,
  })

  React.useEffect(() => {
    if (!householdId) return
    getHouseholdMembers(householdId)
      .then(setMembers)
      .catch((e) => setError(toErrorMessage(e)))
  }, [householdId])

  function flip(key: keyof typeof toggles) {
    setToggles((t) => ({ ...t, [key]: !t[key] }))
  }

  async function submitIngredient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await addCustomIngredient({ ...form, name: form.name.trim() })
      toast(`Added "${form.name.trim()}" to ingredient database`)
      setForm(EMPTY_INGREDIENT)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const householdName = householdLabel(members)

  return (
    <div className="flex flex-col gap-5 pb-28">
      <ScreenHeader subtitle="Settings" members={members} />
      <SectionTitle
        icon={<SettingsIcon className="size-5 text-primary" />}
        title="Settings"
        subtitle={householdName}
      />

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-primary" />
            Household members
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast("Inviting members is coming soon.")}
          >
            + Invite
          </Button>
        </div>
        <ul className="space-y-2">
          {members.map((m, idx) => (
            <li key={m.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 px-3 py-2.5">
              <Avatar initial={memberInitial(m)} color={memberColor(m, idx)} size={32} ring={false} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {round(m.weightKg, 1)} kg · BMR {round(m.bmr)} · TDEE {round(m.tdee)} · Target{" "}
                  {round(m.targetCalories)} kcal / {round(m.targetProtein)}g protein
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-bold">Add custom ingredient</h3>
        <form onSubmit={submitIngredient} className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ingredient name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["caloriesPer100g", "Calories / 100g"],
                ["proteinPer100g", "Protein / 100g"],
                ["carbsPer100g", "Carbs / 100g"],
                ["fatPer100g", "Fat / 100g"],
                ["sugarPer100g", "Sugar / 100g"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: Number(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Add ingredient"}
          </Button>
        </form>
      </Card>

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

      <p className="text-center text-xs text-muted-foreground">
        MacroShare · Shared household #{householdId}
      </p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  )
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
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-secondary/50"
    >
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

function LinkRow({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-secondary/50"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{title}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  )
}
