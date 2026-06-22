"use client"

import * as React from "react"
import { useAuth } from "@/auth/AuthContext"
import { useApp } from "@/components/app-context"
import { toErrorMessage } from "@/lib/api/client"
import {
  getBodyCompositionHistory,
  getDailyProgress,
  getHouseholdMembers,
  logBodyComposition,
  updateProfile,
} from "@/lib/api/services"
import { householdLabel, memberColor, memberInitial } from "@/lib/helpers"
import type { BodyCompositionEntry, DailyProgress, HouseholdMember } from "@/lib/types"
import { num, round } from "@/lib/utils"
import { ScreenHeader, SectionTitle } from "@/components/screen-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/widgets"
import { User, Activity, Scale, TrendingDown, TrendingUp, Users } from "lucide-react"

export function AccountScreen() {
  const { user, profile, householdId, refreshProfile } = useAuth()
  const { dataVersion, bumpData } = useApp()
  const [members, setMembers] = React.useState<HouseholdMember[]>([])
  const [progress, setProgress] = React.useState<DailyProgress[]>([])
  const [selectedId, setSelectedId] = React.useState<number>(user?.userId ?? 0)
  const [history, setHistory] = React.useState<BodyCompositionEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [feedback, setFeedback] = React.useState<string | null>(null)

  const [scaleForm, setScaleForm] = React.useState({
    measuredAt: new Date().toISOString().slice(0, 16),
    weightKg: "",
    bodyFatPercent: "",
    bmr: "",
    applyToProfile: true,
    recalculateTargets: false,
  })
  const [targets, setTargets] = React.useState({ calories: "", protein: "" })

  const reload = React.useCallback(async () => {
    if (!householdId) return
    setLoading(true)
    try {
      const viewId = selectedId || user?.userId
      const [m, p, h] = await Promise.all([
        getHouseholdMembers(householdId),
        getDailyProgress(),
        getBodyCompositionHistory(viewId || undefined, 30),
      ])
      setMembers(m)
      setProgress(p)
      setHistory(h)
      if (!selectedId && m.length > 0) setSelectedId(user?.userId ?? m[0].id)
      setError(null)
    } catch (e) {
      setError(toErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [householdId, selectedId, user?.userId])

  React.useEffect(() => {
    reload()
  }, [reload, dataVersion])

  React.useEffect(() => {
    if (profile && profile.id === selectedId) {
      setTargets({
        calories: String(profile.targetCalories),
        protein: String(profile.targetProtein),
      })
      setScaleForm((prev) => ({
        ...prev,
        weightKg: profile.weightKg ? String(profile.weightKg) : prev.weightKg,
        bmr: profile.bmr ? String(profile.bmr) : prev.bmr,
      }))
    }
  }, [profile, selectedId])

  const member = members.find((m) => m.id === selectedId) ?? members[0]
  const householdName = householdLabel(members)
  const isOwnProfile = user?.userId === selectedId

  async function saveScale(e: React.FormEvent) {
    e.preventDefault()
    if (!num(scaleForm.weightKg)) return
    setSaving(true)
    setFeedback(null)
    setError(null)
    try {
      await logBodyComposition({
        measuredAt: new Date(scaleForm.measuredAt).toISOString(),
        weightKg: num(scaleForm.weightKg)!,
        bodyFatPercent: num(scaleForm.bodyFatPercent),
        bmr: num(scaleForm.bmr),
        applyToProfile: scaleForm.applyToProfile,
        recalculateTargets: scaleForm.recalculateTargets,
      })
      setFeedback("Scale reading saved.")
      await reload()
      await refreshProfile()
      bumpData()
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveTargets(e: React.FormEvent) {
    e.preventDefault()
    if (!isOwnProfile) return
    setSaving(true)
    setError(null)
    try {
      await updateProfile({
        targetCalories: num(targets.calories),
        targetProtein: num(targets.protein),
      })
      setFeedback("Targets updated.")
      await refreshProfile()
      await reload()
      bumpData()
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading && members.length === 0) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading account…</div>
  }

  return (
    <div className="flex flex-col gap-5 pb-28">
      <ScreenHeader subtitle="Account & Profiles" members={members} />
      <SectionTitle icon={<User className="size-5 text-primary" />} title="Account" subtitle={householdName} />

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {feedback && <p className="text-sm font-medium text-emerald-400">{feedback}</p>}

      <Card className="p-4">
        <div className="mb-3 text-sm font-medium text-muted-foreground">Today&apos;s progress</div>
        <div className="flex flex-col gap-3">
          {progress.map((p, idx) => {
            const m = members.find((x) => x.id === p.userId)
            const color = m ? memberColor(m, idx) : "#2563eb"
            const calPct = p.targetCalories
              ? Math.min(100, (p.consumedCalories / p.targetCalories) * 100)
              : 0
            const protPct = p.targetProtein
              ? Math.min(100, (p.consumedProtein / p.targetProtein) * 100)
              : 0
            return (
              <div key={p.userId} className="rounded-xl bg-secondary/40 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Avatar
                    initial={m ? memberInitial(m) : p.name[0]}
                    color={color}
                    size={28}
                    ring={false}
                  />
                  <span className="text-sm font-semibold">{p.name}</span>
                </div>
                <div className="space-y-2">
                  <ProgressLine
                    label="Calories"
                    value={`${round(p.consumedCalories)}/${round(p.targetCalories)} kcal`}
                    pct={calPct}
                    color={color}
                  />
                  <ProgressLine
                    label="Protein"
                    value={`${round(p.consumedProtein)}/${round(p.targetProtein)}g`}
                    pct={protPct}
                    color="#10b981"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="size-4" />
          Household members
        </div>
        <div className="flex gap-2">
          {members.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedId(m.id)}
              className={`flex flex-1 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                m.id === selectedId
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/40 hover:bg-secondary"
              }`}
            >
              <Avatar initial={memberInitial(m)} color={memberColor(m, idx)} size={36} ring={false} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {round(m.targetCalories)} kcal
                </p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {member && <ProfileCard member={member} email={isOwnProfile ? profile?.email : undefined} />}

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Scale className="size-4 text-primary" />
          Smart scale history
        </div>
        <div className="flex flex-col gap-2">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">No scale readings yet.</p>
          )}
          {history.map((r, i) => {
            const prev = history[i + 1]
            const changeKg = prev ? r.weightKg - prev.weightKg : 0
            const down = changeKg < 0
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium tabular-nums">{round(r.weightKg, 1)} kg</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.measuredAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {r.bodyFatPercent != null && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {round(r.bodyFatPercent, 1)}% BF
                    </span>
                  )}
                  {prev && (
                    <Badge
                      variant="outline"
                      className={`gap-1 tabular-nums ${down ? "text-emerald-400" : "text-muted-foreground"}`}
                    >
                      {down ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                      {changeKg > 0 ? "+" : ""}
                      {round(changeKg, 1)}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {isOwnProfile && (
        <>
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold">Log scale reading</h3>
            <form onSubmit={saveScale} className="space-y-3">
              <div>
                <Label className="text-xs">Date & time</Label>
                <Input
                  type="datetime-local"
                  value={scaleForm.measuredAt}
                  onChange={(e) => setScaleForm({ ...scaleForm, measuredAt: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={scaleForm.weightKg}
                    onChange={(e) => setScaleForm({ ...scaleForm, weightKg: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Body fat %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={scaleForm.bodyFatPercent}
                    onChange={(e) =>
                      setScaleForm({ ...scaleForm, bodyFatPercent: e.target.value })
                    }
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={scaleForm.applyToProfile}
                  onChange={(e) =>
                    setScaleForm({ ...scaleForm, applyToProfile: e.target.checked })
                  }
                />
                Update my profile weight & BMR from this reading
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={scaleForm.recalculateTargets}
                  onChange={(e) =>
                    setScaleForm({ ...scaleForm, recalculateTargets: e.target.checked })
                  }
                />
                Recalculate calorie & protein targets (15% deficit)
              </label>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving…" : "Save reading"}
              </Button>
            </form>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold">Adjust daily targets</h3>
            <form onSubmit={saveTargets} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={targets.calories}
                  onChange={(e) => setTargets({ ...targets, calories: e.target.value })}
                  placeholder="Target calories"
                />
                <Input
                  type="number"
                  value={targets.protein}
                  onChange={(e) => setTargets({ ...targets, protein: e.target.value })}
                  placeholder="Target protein (g)"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full" disabled={saving}>
                Update targets
              </Button>
            </form>
          </Card>
        </>
      )}
    </div>
  )
}

function ProgressLine({
  label,
  value,
  pct,
  color,
}: {
  label: string
  value: string
  pct: number
  color: string
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function ProfileCard({
  member,
  email,
}: {
  member: HouseholdMember
  email?: string
}) {
  const idx = member.id
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar initial={memberInitial(member)} color={memberColor(member, idx)} size={52} />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{member.name}</h3>
          {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        {round(member.weightKg, 1)} kg · BMR {round(member.bmr)} · TDEE {round(member.tdee)} · Target{" "}
        {round(member.targetCalories)} kcal / {round(member.targetProtein)}g protein
      </p>

      <Separator className="my-4" />

      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Activity className="size-4 text-primary" />
        Body metrics
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Height" value={`${round(member.heightCm)} cm`} />
        <Metric label="Weight" value={`${round(member.weightKg, 1)} kg`} />
        <Metric label="Sex" value={member.sex} />
        <Metric label="BMR" value={`${round(member.bmr)}`} unit="kcal" />
        <Metric label="TDEE" value={`${round(member.tdee)}`} unit="kcal" />
        <Metric label="Protein" value={`${round(member.targetProtein)}`} unit="g" highlight />
      </div>
    </Card>
  )
}

function Metric({
  label,
  value,
  unit,
  highlight,
}: {
  label: string
  value: string
  unit?: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg px-3 py-2.5 ${highlight ? "bg-primary/10" : "bg-secondary/40"}`}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}
