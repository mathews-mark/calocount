"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFoodEntries } from "@/lib/supabase-client"

export function PopularMeals() {
  const [popularMeals, setPopularMeals] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    async function loadPopularMeals() {
      const entries = await getFoodEntries()

      if (entries.length === 0) return

      // Count occurrences of each meal
      const mealCounts: Record<string, number> = {}

      entries.forEach((entry) => {
        if (!entry.name) return

        const mealName = entry.name.trim()
        if (mealName) {
          mealCounts[mealName] = (mealCounts[mealName] || 0) + 1
        }
      })

      // Sort meals by count and take top 10
      const sortedMeals = Object.entries(mealCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      setPopularMeals(sortedMeals)
    }

    loadPopularMeals()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Most Popular Meals</CardTitle>
      </CardHeader>
      <CardContent>
        {popularMeals.length > 0 ? (
          <div className="space-y-4">
            {popularMeals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="font-medium">{meal.name}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground">{meal.count} times</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No meal data available.</p>
        )}
      </CardContent>
    </Card>
  )
}
