"use client"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Apple } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex w-full items-center justify-between">
      <Link href="/" className="mr-6 flex items-center space-x-2 font-bold text-xl hover:opacity-80 transition-opacity">
        <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
          <Apple className="h-5 w-5" />
        </div>
        <span className="gradient-text">CalTrack</span>
      </Link>

      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/stats"
          className={cn(
            "transition-all hover:text-primary relative",
            pathname === "/stats"
              ? "text-primary font-semibold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground",
          )}
        >
          Stats
        </Link>
        <Link
          href="/history"
          className={cn(
            "transition-all hover:text-primary relative",
            pathname === "/history"
              ? "text-primary font-semibold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground",
          )}
        >
          History
        </Link>
        <Link
          href="/weight"
          className={cn(
            "transition-all hover:text-primary relative",
            pathname === "/weight"
              ? "text-primary font-semibold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground",
          )}
        >
          Weight
        </Link>
        <Link
          href="/targets"
          className={cn(
            "transition-all hover:text-primary relative",
            pathname === "/targets"
              ? "text-primary font-semibold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground",
          )}
        >
          Targets
        </Link>
        <Link
          href="/settings"
          className={cn(
            "transition-all hover:text-primary relative",
            pathname === "/settings"
              ? "text-primary font-semibold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground",
          )}
        >
          Settings
        </Link>
      </nav>
    </div>
  )
}
