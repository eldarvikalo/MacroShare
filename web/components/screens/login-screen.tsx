"use client"

import * as React from "react"
import { useAuth } from "@/auth/AuthContext"
import { toErrorMessage } from "@/lib/api/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"

export function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = React.useState("eldar@macroshare.app")
  const [password, setPassword] = React.useState("EldarDina18041006!")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { name: "Eldar", email: "eldar@macroshare.app" },
    { name: "Dina", email: "dina@macroshare.app" },
  ]

  return (
    <div className="relative flex min-h-svh items-center justify-center px-5 py-10">
      <div className="glow-top pointer-events-none absolute inset-x-0 top-0 h-80" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="text-3xl" />
          </div>
          <p className="text-balance text-sm leading-relaxed text-slate-400">
            Sign in to track your cut, log scale readings, and split meals together.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  placeholder="you@macroshare.app"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Demo accounts
          </p>
          <div className="flex flex-col gap-2">
            {demoAccounts.map((m) => (
              <button
                key={m.email}
                type="button"
                onClick={() => {
                  setEmail(m.email)
                  setError("")
                }}
                className="flex items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2 text-left transition-colors hover:bg-slate-800 active:scale-[0.99]"
              >
                <span className="text-sm font-medium text-slate-200">{m.name}</span>
                <span className="text-xs text-slate-400">{m.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Password: <span className="font-mono text-slate-400">EldarDina18041006!</span>
          </p>
        </div>
      </div>
    </div>
  )
}
