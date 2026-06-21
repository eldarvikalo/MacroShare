"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Toast = { id: number; message: string }

const ToastContext = React.createContext<{ toast: (msg: string) => void }>({
  toast: () => {},
})

export function useToast() {
  return React.useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur animate-slide-up"
            )}
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-slate-100">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
