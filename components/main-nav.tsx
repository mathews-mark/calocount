"use client"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MobileLink } from "@/components/mobile-link"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <MobileLink
        href="/"
        className={cn(
          "mr-4 flex items-center space-x-2",
          pathname === "/" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
        )}
      >
        <span>Home</span>
      </MobileLink>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <MobileLink
          href="/add"
          className={cn(pathname === "/add" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground")}
        >
          Add
        </MobileLink>
        <MobileLink
          href="/stats"
          className={cn(
            pathname === "/stats" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Stats
        </MobileLink>
        <MobileLink
          href="/history"
          className={cn(
            pathname === "/history" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          History
        </MobileLink>
        <MobileLink
          href="/weight"
          className={cn(
            pathname === "/weight" ? "font-bold" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Weight
        </MobileLink>
      </nav>
    </div>
  )
}
