import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CalorieApp v0",
  description: "Track your daily calorie intake",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="border-b">
            <div className="container mx-auto py-4 px-4">
              <nav className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href="/" className="text-xl font-bold">
                  CalorieApp v0
                </Link>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <NavLink href="/">Add Entry</NavLink>
                  <NavLink href="/stats">Stats</NavLink>
                  <NavLink href="/history">History</NavLink>
                  <NavLink href="/weight">Weight</NavLink>
                  <NavLink href="/targets">Targets</NavLink>
                  <NavLink href="/strava">Strava</NavLink>
                  <NavLink href="/settings">Settings</NavLink>
                </div>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-4">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CalorieApp v0
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("text-sm font-medium transition-colors hover:text-primary")}>
      {children}
    </Link>
  )
}
