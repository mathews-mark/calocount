"use client"

import { useState } from "react"
import { AddEntryForm } from "@/components/add-entry-form"
import { TodaySummary } from "@/components/today-summary"

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const bumpRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <TodaySummary refreshKey={refreshKey} />
        <AddEntryForm onEntryAdded={bumpRefresh} />
      </div>
    </div>
  )
}
