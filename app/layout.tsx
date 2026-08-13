import type React from "react"
import type { Metadata, Viewport } from "next"
import { MantineProvider, ColorSchemeScript } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "./globals.css"
import { MainNav } from "@/components/main-nav"
import { ServiceWorkerRegister } from "@/components/service-worker-register"

export const metadata: Metadata = {
  title: "CalTrack — AI-Powered Nutrition Tracking",
  description: "Track your daily calorie intake with AI-powered meal analysis and voice input",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  applicationName: "CalTrack",
  appleWebApp: {
    capable: true,
    title: "CalTrack",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider
          theme={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontFamilyMonospace: "Monaco, Courier, monospace",
            headings: {
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: "650",
            },
            colors: {
              // Verdant — leafy green brand ramp
              verdant: [
                "#f2f8f3",
                "#e3f2e7",
                "#c3e5cc",
                "#9fd7af",
                "#6fc189",
                "#3fae67",
                "#16a34a",
                "#128c3f",
                "#0f7434",
                "#14532d",
              ],
              // Warm neutral ramp replacing Mantine's cool grays
              sand: [
                "#faf9f5",
                "#f4f2ea",
                "#e7e4dc",
                "#d8d4c8",
                "#bdb8a9",
                "#9c9789",
                "#78716c",
                "#57534e",
                "#3a3733",
                "#1c1917",
              ],
            },
            primaryColor: "verdant",
            primaryShade: 6,
            defaultRadius: "md",
            radius: {
              xs: "6px",
              sm: "8px",
              md: "12px",
              lg: "16px",
              xl: "20px",
            },
            other: {
              macroProtein: "#2563eb",
              macroCarbs: "#f59e0b",
              macroFat: "#db2777",
            },
          }}
        >
          <Notifications position="top-right" />
          <ServiceWorkerRegister />
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-card/85 backdrop-blur-md">
              <div className="container mx-auto px-4">
                <MainNav />
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">{children}</main>

            <footer className="mt-16 border-t border-border">
              <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                <p>© 2025 CalTrack. Track smarter, live healthier.</p>
              </div>
            </footer>
          </div>
        </MantineProvider>
      </body>
    </html>
  )
}
