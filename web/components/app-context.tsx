"use client"

import * as React from "react"
import type { HouseholdMember } from "@/lib/types"
import { MEMBERS } from "@/lib/members"

export type TabId = "dashboard" | "cook" | "pantry" | "account" | "settings"

interface AppState {
  user: HouseholdMember | null
  activeTab: TabId
  selectedRecipeId: number
  loggedMealIds: number[]
  login: (email: string) => boolean
  logout: () => void
  setActiveTab: (tab: TabId) => void
  goToCookWithRecipe: (recipeId: number) => void
  logMeal: (recipeId: number) => void
}

const AppContext = React.createContext<AppState | null>(null)

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<HouseholdMember | null>(null)
  const [activeTab, setActiveTab] = React.useState<TabId>("dashboard")
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<number>(1)
  const [loggedMealIds, setLoggedMealIds] = React.useState<number[]>([])

  const login = React.useCallback((email: string) => {
    const found = MEMBERS.find((m) => m.email.toLowerCase() === email.trim().toLowerCase())
    if (found) {
      setUser(found)
      setActiveTab("dashboard")
      return true
    }
    return false
  }, [])

  const logout = React.useCallback(() => setUser(null), [])

  const goToCookWithRecipe = React.useCallback((recipeId: number) => {
    setSelectedRecipeId(recipeId)
    setActiveTab("cook")
  }, [])

  const logMeal = React.useCallback((recipeId: number) => {
    setLoggedMealIds((ids) => (ids.includes(recipeId) ? ids : [...ids, recipeId]))
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        selectedRecipeId,
        loggedMealIds,
        login,
        logout,
        setActiveTab,
        goToCookWithRecipe,
        logMeal,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
