"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"
import type { CalorieEntry } from "@/types/calorie-entry"

interface TargetComparisonChartsProps {
  entries: CalorieEntry[]
  dateFormat: string
}

export function TargetComparisonCharts({ entries, dateFormat }: TargetComparisonChartsProps) {
  const [targets, setTargets] = useState<{ calorieTarget: number; proteinTarget: number }>({
    calorieTarget: 2000,
    proteinTarget: 100,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTargets() {
      try {
        const response = await fetch("/api/targets")
        const data = await response.json()

        if (data.success) {
          setTargets(data.targets)
        }
      } catch (error) {
        console.error("Error loading targets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTargets()
  }, [])

  // Prepare data for calorie comparison chart
  const getCalorieComparisonData = () => {
    const dailyTotals: Record<string, number> = {}

    // Group entries by date and sum calories
    entries.forEach((entry) => {
      const date = entry.date
      dailyTotals[date] = (dailyTotals[date] || 0) + entry.calories
    })

    // Convert to array for chart
    return Object.entries(dailyTotals)
      .map(([date, calories]) => ({
        date: format(new Date(date), dateFormat),
        actual: calories,
        target: targets.calorieTarget,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Prepare data for protein comparison chart
  const getProteinComparisonData = () => {
    const dailyTotals: Record<string, number> = {}

    // Group entries by date and sum protein
    entries.forEach((entry) => {
      const date = entry.date
      dailyTotals[date] = (dailyTotals[date] || 0) + entry.protein
    })

    // Convert to array for chart
    return Object.entries(dailyTotals)
      .map(([date, protein]) => ({
        date: format(new Date(date), dateFormat),
        actual: protein,
        target: targets.proteinTarget,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Calories: Target vs. Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getCalorieComparisonData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" name="Actual Calories" fill="hsl(var(--primary))" />
                <Bar dataKey="target" name="Target Calories" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Protein: Target vs. Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getProteinComparisonData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" name="Actual Protein (g)" fill="hsl(var(--primary))" />
                <Bar dataKey="target" name="Target Protein (g)" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
