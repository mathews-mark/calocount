"use client"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link
        href="/"
        className={cn(
          "mr-4 flex items-center space-x-2",
          pathname === "/" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
        )}
      >
        <span>Home</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/stats"
          className={cn(
            pathname === "/stats" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Stats
        </Link>
        <Link
          href="/history"
          className={cn(
            pathname === "/history" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          History
        </Link>
        <Link
          href="/weight"
          className={cn(
            pathname === "/weight" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Weight
        </Link>
        <Link
          href="/targets"
          className={cn(
            pathname === "/targets" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Targets
        </Link>
        <Link
          href="/settings"
          className={cn(
            pathname === "/settings" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Settings
        </Link>
      </nav>
    </div>
  )
}
