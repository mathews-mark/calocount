"use client"

import type React from "react"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface MobileLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function MobileLink({ href, children, className = "" }: MobileLinkProps) {
  const isMobile = useMobile()

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault()
      // Open in a new tab/window which works better on mobile
      window.open(href, "_blank")
    }
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleClick} asChild={!isMobile}>
      {isMobile ? (
        <div className="flex items-center">
          <ExternalLink className="mr-2 h-4 w-4" />
          {children}
        </div>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center">
          <ExternalLink className="mr-2 h-4 w-4" />
          {children}
        </a>
      )}
    </Button>
  )
}
