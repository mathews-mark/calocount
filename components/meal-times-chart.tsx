"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { getFoodEntries } from "@/lib/supabase-client"

export function MealTimesChart() {
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    async function loadChartData() {
      const entries = await getFoodEntries()

      if (entries.length === 0) return

      // Define meal times
      const mealTimes = {
        "Breakfast (5am-10am)": { count: 0, color: "#FF8042" },
        "Lunch (10am-3pm)": { count: 0, color: "#FFBB28" },
        "Dinner (3pm-8pm)": { count: 0, color: "#0088FE" },
        "Late Night (8pm-5am)": { count: 0, color: "#00C49F" },
      }

      // Count entries by meal time
      entries.forEach((entry) => {
        if (!entry.date) return

        const hour = new Date(entry.date).getHours()

        if (hour >= 5 && hour < 10) {
          mealTimes["Breakfast (5am-10am)"].count++
        } else if (hour >= 10 && hour < 15) {
          mealTimes["Lunch (10am-3pm)"].count++
        } else if (hour >= 15 && hour < 20) {
          mealTimes["Dinner (3pm-8pm)"].count++
        } else {
          mealTimes["Late Night (8pm-5am)"].count++
        }
      })

      // Format data for chart
      const data = Object.entries(mealTimes)
        .filter(([_, { count }]) => count > 0)
        .map(([name, { count, color }]) => ({
          name,
          value: count,
          color,
        }))

      setChartData(data)
    }

    loadChartData()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meal Times Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
