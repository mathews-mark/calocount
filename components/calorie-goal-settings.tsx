"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CalorieGoalSettingsProps {
  currentGoal: number
  onSave: (newGoal: number) => void
}

export function CalorieGoalSettings({ currentGoal, onSave }: CalorieGoalSettingsProps) {
  const [goal, setGoal] = useState(currentGoal)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(goal)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Calorie Goal</CardTitle>
        <CardDescription>Adjust your daily calorie target</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="calorieGoal" className="text-sm font-medium">
              Daily Calorie Goal
            </label>
            <Input
              id="calorieGoal"
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              min={500}
              max={10000}
            />
          </div>
          <Button type="submit">Save Goal</Button>
        </form>
      </CardContent>
    </Card>
  )
}
