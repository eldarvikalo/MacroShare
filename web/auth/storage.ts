const TOKEN_KEY = "macroshare_token"
const USER_KEY = "macroshare_user"

export interface StoredUser {
  userId: number
  householdId: number
  name: string
  email: string
  avatarColor: string | null
}

function canUseStorage() {
  return typeof window !== "undefined"
}

export function getToken(): string | null {
  if (!canUseStorage()) return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, user: StoredUser): void {
  if (!canUseStorage()) return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser(): StoredUser | null {
  if (!canUseStorage()) return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function clearAuth(): void {
  if (!canUseStorage()) return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
