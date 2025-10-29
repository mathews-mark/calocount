import type React from "react"
import type { Metadata } from "next"
import { MantineProvider, ColorSchemeScript } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "./globals.css"
import { MainNav } from "@/components/main-nav"

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
              fontWeight: "600",
            },
            colors: {
              dark: [
                "#f5f5f5",
                "#e7e7e7",
                "#cdcdcd",
                "#b2b2b2",
                "#9a9a9a",
                "#8b8b8b",
                "#848484",
                "#717171",
                "#656565",
                "#121212",
              ],
            },
            primaryColor: "dark",
            defaultRadius: "sm",
          }}
        >
          <Notifications position="top-right" />
          <div className="min-h-screen bg-white">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
              <div className="container mx-auto px-4">
                <MainNav />
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">{children}</main>

            <footer className="border-t border-gray-200 bg-white mt-16">
              <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
                <p>© 2025 Calorie Tracker. Track smarter, live healthier.</p>
              </div>
            </footer>
          </div>
        </MantineProvider>
      </body>
    </html>
  )
}
