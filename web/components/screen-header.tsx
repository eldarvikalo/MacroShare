"use client"

import { useApp } from "@/components/app-context"
import { Avatar } from "@/components/widgets"
import { Logo } from "@/components/logo"
import { HOUSEHOLD_NAME } from "@/lib/members"

const TODAY = "Sunday, June 21, 2026"

export function ScreenHeader({ subtitle }: { subtitle?: string }) {
  const { user } = useApp()
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{subtitle ?? TODAY}</p>
        <Logo className="text-xl" />
      </div>
      {user && (
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-200">{user.name}</p>
            <p className="text-[10px] text-slate-500">{HOUSEHOLD_NAME}</p>
          </div>
          <Avatar initial={user.initial} color={user.avatarColor} size={36} />
        </div>
      )}
    </div>
  )
}

export const TODAY_LABEL = TODAY
