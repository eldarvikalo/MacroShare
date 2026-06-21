import axios from "axios";
import { clearAuth, getToken } from "../auth/storage";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export const DEFAULT_HOUSEHOLD_ID = Number(
  import.meta.env.VITE_DEFAULT_HOUSEHOLD_ID ?? "1"
);

/** @deprecated Prefer householdId from useAuth() */
export function legacyHouseholdId(fallback: number | null): number {
  return fallback ?? DEFAULT_HOUSEHOLD_ID;
}

/** Normalizes API error responses (see ExceptionHandlingMiddleware) into a string. */
export function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    if (data?.errors) {
      const flat = Object.values(data.errors).flat();
      if (flat.length > 0) return flat.join(" ");
    }
    if (data?.message) return data.message;
    return error.message;
  }
  return "Unexpected error. Is the API running?";
}
