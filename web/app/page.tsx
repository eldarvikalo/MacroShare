"use client"

import { useAuth } from "@/auth/AuthContext"
import { useApp } from "@/components/app-context"
import { BottomNav } from "@/components/bottom-nav"
import { LoginScreen } from "@/components/screens/login-screen"
import { DashboardScreen } from "@/components/screens/dashboard-screen"
import { CookScreen } from "@/components/screens/cook-screen"
import { PantryScreen } from "@/components/screens/pantry-screen"
import { AccountScreen } from "@/components/screens/account-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"

export default function Page() {
  const { user, isLoading } = useAuth()
  const { activeTab } = useApp()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-slate-500">
        Loading MacroShare…
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <div className="relative mx-auto flex min-h-svh max-w-lg flex-col bg-background">
      <div className="glow-top pointer-events-none absolute inset-x-0 top-0 h-64" />
      <main key={activeTab} className="relative flex-1 animate-fade-in px-4 pb-24 pt-4">
        {activeTab === "dashboard" && <DashboardScreen />}
        {activeTab === "cook" && <CookScreen />}
        {activeTab === "pantry" && <PantryScreen />}
        {activeTab === "account" && <AccountScreen />}
        {activeTab === "settings" && <SettingsScreen />}
      </main>
      <BottomNav />
    </div>
  )
}
