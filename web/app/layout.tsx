import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/components/app-context"
import { ToastProvider } from "@/components/toast"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "MacroShare — Cook one meal, split it perfectly",
  description:
    "A shared household diet tracker for couples who cook one meal together but need different portion sizes based on each person's calorie and macro targets.",
}

export const viewport: Viewport = {
  themeColor: "#0a0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark bg-background ${inter.variable}`}>
      <body className="font-sans antialiased">
        <AppProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppProvider>
      </body>
    </html>
  )
}
