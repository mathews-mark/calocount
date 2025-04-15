"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getFoodEntries } from "@/lib/supabase-client"
import type { Entry } from "@/types"
import { format, parseISO } from "date-fns"

// Helper function to adjust for timezone offset
function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  // No longer adding an extra day
  return date
}

export function WeeklyCalorieChart() {
  const [chartData, setChartData] = useState<{ name: string; calories: number }[]>([])

  useEffect(() => {
    async function loadChartData() {
      const entries = await getFoodEntries()

      if (entries.length === 0) return

      // Get the last 7 days
      const today = new Date()
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        return date.toISOString().split("T")[0]
      }).reverse()

      // Group entries by date
      const entriesByDate = entries.reduce((acc: Record<string, Entry[]>, entry) => {
        const date = entry.date.split("T")[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(entry)
        return acc
      }, {})

      // Calculate calories for each of the last 7 days
      const data = last7Days.map((date) => {
        const dayEntries = entriesByDate[date] || []
        const totalCalories = dayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0)

        // Adjust for timezone and format the date
        const adjustedDate = adjustForTimezone(date)
        const formattedDate = format(adjustedDate, "EEE, MMM d") // Format as "Mon, Jan 1"

        return {
          name: formattedDate,
          calories: totalCalories,
        }
      })

      setChartData(data)
    }

    loadChartData()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weekly Calorie Intake</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="calories" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
