"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import { Text, Loader, Skeleton } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconBolt, IconPlus } from "@tabler/icons-react"
import type { CalorieEntry, MealSuggestion } from "@/types/calorie-entry"

interface QuickLogProps {
  onLogged?: (entry: CalorieEntry) => void
  limit?: number
}

export function QuickLog({ onLogged, limit = 5 }: QuickLogProps) {
  const [meals, setMeals] = useState<MealSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingName, setSavingName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/popular-meals?limit=${limit}`)
        const data = await res.json()
        if (!cancelled && data.success) setMeals(data.popularMeals ?? [])
      } catch (error) {
        console.error("Error loading quick-log meals:", error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [limit])

  const logMeal = async (meal: MealSuggestion) => {
    if (savingName) return
    setSavingName(meal.mealName)

    const now = new Date()
    const entry: CalorieEntry = {
      id: uuidv4(),
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      mealName: meal.mealName,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      portion: 1,
      photoUrl: "",
      notes: "",
    }

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
      const data = await res.json()

      if (!data.success) throw new Error(data.error || "Failed to save entry")

      notifications.show({
        title: "Logged",
        message: `${meal.mealName} — ${meal.calories} cal`,
        color: "verdant",
      })
      onLogged?.(entry)
    } catch (error) {
      console.error("Error quick-logging meal:", error)
      notifications.show({
        title: "Couldn't log that",
        message: "Something went wrong saving the entry. Please try again.",
        color: "red",
      })
    } finally {
      setSavingName(null)
    }
  }

  if (!isLoading && meals.length === 0) return null

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-1.5">
        <IconBolt size={17} className="text-primary" />
        <Text size="sm" fw={600}>
          Quick log
        </Text>
        <Text size="xs" c="dimmed">
          — your usual meals, one tap
        </Text>
      </div>

      <div className="flex flex-wrap gap-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={38} width={150} radius="lg" />)
          : meals.map((meal) => {
              const saving = savingName === meal.mealName
              return (
                <button
                  key={meal.mealName}
                  type="button"
                  onClick={() => logMeal(meal)}
                  disabled={savingName !== null}
                  title={`P ${meal.protein}g · C ${meal.carbs}g · F ${meal.fat}g`}
                  className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left transition-all hover:border-primary hover:bg-accent disabled:opacity-50"
                >
                  <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {saving ? <Loader size={11} color="currentColor" /> : <IconPlus size={13} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium leading-tight text-foreground">
                      {meal.mealName}
                    </span>
                    <span className="block text-[11px] leading-tight text-muted-foreground">{meal.calories} cal</span>
                  </span>
                </button>
              )
            })}
      </div>
    </div>
  )
}
