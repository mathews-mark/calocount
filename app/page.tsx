"use client"

import { useState } from "react"
import { Paper } from "@mantine/core"
import { AddEntryForm } from "@/components/add-entry-form"
import { TodaySummary } from "@/components/today-summary"
import { QuickLog } from "@/components/quick-log"

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const bumpRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <TodaySummary refreshKey={refreshKey} />

        <Paper
          p="lg"
          radius="lg"
          withBorder
          style={{
            borderColor: "hsl(var(--border))",
            backgroundColor: "hsl(var(--card))",
            boxShadow: "0 1px 3px rgba(20, 50, 30, 0.05)",
          }}
        >
          <QuickLog onLogged={bumpRefresh} />
        </Paper>

        <AddEntryForm onEntryAdded={bumpRefresh} />
      </div>
    </div>
  )
}
