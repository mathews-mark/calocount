"use client"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Leaf } from "lucide-react"

const links = [
  { href: "/", label: "Today" },
  { href: "/stats", label: "Stats" },
  { href: "/history", label: "History" },
  { href: "/weight", label: "Weight" },
  { href: "/targets", label: "Targets" },
  { href: "/settings", label: "Settings" },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex w-full items-center justify-between gap-4 py-3">
      <Link
        href="/"
        className="flex flex-none items-center gap-2.5 text-xl font-bold transition-opacity hover:opacity-80"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="gradient-text">CalTrack</span>
      </Link>

      <nav className="-mx-1 flex items-center gap-1 overflow-x-auto text-sm font-medium">
        {links.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative whitespace-nowrap rounded-lg px-3 py-1.5 transition-all",
                active
                  ? "bg-accent font-semibold text-emphasis"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
