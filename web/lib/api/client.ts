import axios from "axios"
import { clearAuth, getToken } from "@/auth/storage"

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5080"

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuth()
    }
    return Promise.reject(error)
  }
)

export function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined

    if (data?.errors) {
      const flat = Object.values(data.errors).flat()
      if (flat.length > 0) return flat.join(" ")
    }
    if (data?.message) return data.message
    return error.message
  }
  return "Unexpected error. Is the API running?"
}
