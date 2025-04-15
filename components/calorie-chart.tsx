"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import type { FoodEntry } from "@/components/calorie-tracker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CalorieChartProps {
  entries: FoodEntry[]
  goal: number
}

export function CalorieChart({ entries, goal }: CalorieChartProps) {
  // Prepare data for the last 7 days
  const chartData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return date
    }).reverse()

    return last7Days.map((date) => {
      const dateString = date.toLocaleDateString("en-US", { weekday: "short" })

      // Filter entries for this day
      const dayEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.timestamp)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === date.getTime()
      })

      // Calculate total calories for the day
      const totalCalories = dayEntries.reduce((sum, entry) => sum + entry.calories, 0)

      return {
        day: dateString,
        calories: totalCalories,
        date: date.toLocaleDateString(),
      }
    })
  }, [entries])

  return (
    <ChartContainer
      config={{
        calories: {
          label: "Calories",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
          <YAxis className="text-xs fill-muted-foreground" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ReferenceLine y={goal} stroke="hsl(var(--chart-2))" strokeDasharray="3 3" />
          <Bar dataKey="calories" fill="var(--color-calories)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
