import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Calorie Tracker - AI-Powered Nutrition Tracking",
  description: "Track your daily calorie intake with AI-powered meal analysis and voice input",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="container flex h-16 items-center">
              <MainNav />
            </div>
          </header>

          <main className="container py-6">{children}</main>

          <footer className="border-t bg-background/95 backdrop-blur mt-12">
            <div className="container py-6 text-center text-sm text-muted-foreground">
              <p>© 2025 Calorie Tracker. Track smarter, live healthier.</p>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
