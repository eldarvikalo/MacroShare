"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { getCurrentUser, login as loginRequest } from "@/lib/api/services"
import type { CurrentUser } from "@/lib/types"
import { clearAuth, getStoredUser, getToken, setAuth, type StoredUser } from "@/auth/storage"

interface AuthContextValue {
  user: StoredUser | null
  profile: CurrentUser | null
  householdId: number | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [profile, setProfile] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(null)
      return
    }
    const me = await getCurrentUser()
    setProfile(me)
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (getToken()) {
          await refreshProfile()
        }
      } catch {
        clearAuth()
        if (active) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [refreshProfile])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest(email, password)
      const stored: StoredUser = {
        userId: result.userId,
        householdId: result.householdId,
        name: result.name,
        email: result.email,
        avatarColor: result.avatarColor,
      }
      setAuth(result.token, stored)
      setUser(stored)
      await refreshProfile()
    },
    [refreshProfile]
  )

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      householdId: user?.householdId ?? null,
      isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, profile, isLoading, login, logout, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
