"use client"

import * as React from "react"

export type TabId = "dashboard" | "cook" | "pantry" | "account" | "settings"

interface AppState {
  activeTab: TabId
  selectedRecipeId: number | null
  dataVersion: number
  setActiveTab: (tab: TabId) => void
  goToCookWithRecipe: (recipeId: number) => void
  bumpData: () => void
}

const AppContext = React.createContext<AppState | null>(null)

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<TabId>("dashboard")
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<number | null>(null)
  const [dataVersion, setDataVersion] = React.useState(0)

  const goToCookWithRecipe = React.useCallback((recipeId: number) => {
    setSelectedRecipeId(recipeId)
    setActiveTab("cook")
  }, [])

  const bumpData = React.useCallback(() => {
    setDataVersion((v) => v + 1)
  }, [])

  return (
    <AppContext.Provider
      value={{
        activeTab,
        selectedRecipeId,
        dataVersion,
        setActiveTab,
        goToCookWithRecipe,
        bumpData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
