"use client"

import { useAuth } from "@/auth/AuthContext"
import { Avatar } from "@/components/widgets"
import { Logo } from "@/components/logo"
import { formatTodayLabel, householdLabel, memberColor, memberInitial } from "@/lib/helpers"
import { initials } from "@/lib/utils"
import type { HouseholdMember } from "@/lib/types"

export function ScreenHeader({
  subtitle,
  members = [],
}: {
  subtitle?: string
  members?: HouseholdMember[]
}) {
  const { user } = useAuth()
  const householdName = members.length > 0 ? householdLabel(members) : "MacroShare"

  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{subtitle ?? formatTodayLabel()}</p>
        <Logo className="text-xl" />
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-200">{user.name}</p>
            <p className="text-[10px] text-slate-500">{householdName}</p>
          </div>
          <Avatar
            initial={initials(user.name)}
            color={user.avatarColor ?? "#2563eb"}
            size={36}
          />
        </div>
      )}
    </div>
  )
}

export function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="-mt-1 flex items-center gap-3">
      {icon && (
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          {icon}
        </span>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}

export { memberColor, memberInitial }
