"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFoodEntries } from "@/lib/supabase-client"
import type { Entry } from "@/types"

export function CalorieStats() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    averageCalories: 0,
    highestCalorieDay: { date: "", calories: 0 },
    lowestCalorieDay: { date: "", calories: Number.MAX_SAFE_INTEGER },
  })

  useEffect(() => {
    async function loadStats() {
      const entries = await getFoodEntries()

      if (entries.length === 0) return

      // Group entries by date
      const entriesByDate = entries.reduce((acc: Record<string, Entry[]>, entry) => {
        const date = entry.date.split("T")[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(entry)
        return acc
      }, {})

      // Calculate calories per day
      const caloriesByDate = Object.entries(entriesByDate).map(([date, dayEntries]) => {
        const totalCalories = dayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0)
        return { date, calories: totalCalories }
      })

      // Calculate stats
      const totalCalories = caloriesByDate.reduce((sum, day) => sum + day.calories, 0)
      const averageCalories = Math.round(totalCalories / caloriesByDate.length)

      let highestCalorieDay = { date: "", calories: 0 }
      let lowestCalorieDay = { date: "", calories: Number.MAX_SAFE_INTEGER }

      caloriesByDate.forEach((day) => {
        if (day.calories > highestCalorieDay.calories) {
          highestCalorieDay = day
        }
        if (day.calories < lowestCalorieDay.calories) {
          lowestCalorieDay = day
        }
      })

      setStats({
        totalEntries: entries.length,
        averageCalories,
        highestCalorieDay,
        lowestCalorieDay:
          lowestCalorieDay.calories === Number.MAX_SAFE_INTEGER ? { date: "", calories: 0 } : lowestCalorieDay,
      })
    }

    loadStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEntries}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Calories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageCalories}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Calorie Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.highestCalorieDay.calories}</div>
          <p className="text-xs text-muted-foreground">{stats.highestCalorieDay.date}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lowest Calorie Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lowestCalorieDay.calories}</div>
          <p className="text-xs text-muted-foreground">{stats.lowestCalorieDay.date}</p>
        </CardContent>
      </Card>
    </div>
  )
}
