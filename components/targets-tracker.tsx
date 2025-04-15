"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function TargetsTracker() {
  const [calorieTarget, setCalorieTarget] = useState<string>("")
  const [proteinTarget, setProteinTarget] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingTargets, setIsLoadingTargets] = useState<boolean>(true)

  // Fetch targets on component mount
  useEffect(() => {
    fetchTargets()
  }, [])

  const fetchTargets = async () => {
    setIsLoadingTargets(true)
    try {
      const response = await fetch("/api/targets")
      const data = await response.json()

      if (data.success) {
        setCalorieTarget(data.targets.calorieTarget.toString())
        setProteinTarget(data.targets.proteinTarget.toString())
      }
    } catch (error) {
      console.error("Error fetching targets:", error)
      toast({
        title: "Error",
        description: "Failed to load targets",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTargets(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!calorieTarget || isNaN(Number.parseFloat(calorieTarget)) || Number.parseFloat(calorieTarget) <= 0) {
      toast({
        title: "Invalid calorie target",
        description: "Please enter a valid calorie target value",
        variant: "destructive",
      })
      return
    }

    if (!proteinTarget || isNaN(Number.parseFloat(proteinTarget)) || Number.parseFloat(proteinTarget) <= 0) {
      toast({
        title: "Invalid protein target",
        description: "Please enter a valid protein target value",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const targetEntry = {
        id: `target-${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        calorieTarget: Number.parseFloat(calorieTarget),
        proteinTarget: Number.parseFloat(proteinTarget),
      }

      const response = await fetch("/api/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(targetEntry),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Targets saved",
          description: "Your target values have been saved successfully",
        })
      } else {
        throw new Error(data.error || "Failed to save targets")
      }
    } catch (error) {
      console.error("Error saving targets:", error)
      toast({
        title: "Error",
        description: "Failed to save targets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Nutrition Targets</CardTitle>
          <CardDescription>Define your daily nutrition goals</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTargets ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calorieTarget">Daily Calorie Target</Label>
                  <div className="flex">
                    <Input
                      id="calorieTarget"
                      type="number"
                      step="50"
                      min="0"
                      placeholder="Enter your calorie target"
                      value={calorieTarget}
                      onChange={(e) => setCalorieTarget(e.target.value)}
                      required
                    />
                    <span className="ml-2 flex items-center text-muted-foreground">kcal</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proteinTarget">Daily Protein Target</Label>
                  <div className="flex">
                    <Input
                      id="proteinTarget"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Enter your protein target"
                      value={proteinTarget}
                      onChange={(e) => setProteinTarget(e.target.value)}
                      required
                    />
                    <span className="ml-2 flex items-center text-muted-foreground">g</span>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Targets"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
