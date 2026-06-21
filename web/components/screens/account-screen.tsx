"use client"

import { useState } from "react"
import { ScreenHeader, SectionTitle } from "@/components/screen-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar } from "@/components/widgets"
import { useApp } from "@/components/app-context"
import { MEMBERS, SCALE_READINGS, HOUSEHOLD_NAME } from "@/lib/members"
import type { HouseholdMember } from "@/lib/types"
import { User, Activity, Scale, TrendingDown, TrendingUp, Users } from "lucide-react"

export function AccountScreen() {
  const { user } = useApp()
  const [selectedId, setSelectedId] = useState<number>(user?.id ?? MEMBERS[0].id)
  const member = MEMBERS.find((m) => m.id === selectedId) ?? MEMBERS[0]
  const readings = SCALE_READINGS[member.id] ?? []

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-4">
      <ScreenHeader subtitle="Account & Profiles" />
      <SectionTitle icon={<User className="size-5 text-primary" />} title="Account" subtitle={HOUSEHOLD_NAME} />

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="size-4" />
          Household members
        </div>
        <div className="flex gap-2">
          {MEMBERS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`flex flex-1 items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                m.id === selectedId
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/40 hover:bg-secondary"
              }`}
            >
              <Avatar initial={m.initial} color={m.avatarColor} size={36} ring={false} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.sex}, {m.age}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <ProfileCard member={member} />

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Scale className="size-4 text-primary" />
          Smart scale history
        </div>
        <div className="flex flex-col gap-2">
          {readings.map((r, i) => {
            const down = r.changeKg < 0
            return (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium tabular-nums">{r.weightKg.toFixed(1)} kg</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">{r.bodyFatPercent}% BF</span>
                  <Badge
                    variant="outline"
                    className={`gap-1 tabular-nums ${down ? "text-emerald-400" : "text-muted-foreground"}`}
                  >
                    {r.changeKg === 0 ? null : down ? (
                      <TrendingDown className="size-3" />
                    ) : (
                      <TrendingUp className="size-3" />
                    )}
                    {r.changeKg > 0 ? "+" : ""}
                    {r.changeKg.toFixed(1)}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function ProfileCard({ member }: { member: HouseholdMember }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar initial={member.initial} color={member.avatarColor} size={52} />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        {member.profile}
      </p>

      <Separator className="my-4" />

      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Activity className="size-4 text-primary" />
        Body metrics
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Height" value={`${member.heightCm} cm`} />
        <Metric label="Weight" value={`${member.weightKg} kg`} />
        <Metric label="Age" value={`${member.age}`} />
        <Metric label="BMR" value={`${member.bmr}`} unit="kcal" />
        <Metric label="TDEE" value={`${member.tdee}`} unit="kcal" />
        <Metric label="Activity" value={`${member.activityMultiplier}x`} />
      </div>

      <Separator className="my-4" />

      <div className="mb-3 text-sm font-medium">Daily targets</div>
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Calories" value={`${member.targetCalories}`} unit="kcal" highlight />
        <Metric label="Protein" value={`${member.targetProtein}`} unit="g" highlight />
      </div>

      <Button variant="outline" className="mt-4 w-full">
        Edit profile
      </Button>
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
