"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import TargetHistoryChart from "./target-history-chart"

interface TargetEntry {
  id: string
  date: string
  calorieTarget: number
  proteinTarget: number
}

export function TargetsHistory() {
  const [targetHistory, setTargetHistory] = useState<TargetEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTargetHistory() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/targets/history")
        const data = await response.json()

        if (data.success) {
          setTargetHistory(data.targets)
        } else {
          console.error("Failed to fetch target history:", data.error)
        }
      } catch (error) {
        console.error("Error fetching target history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTargetHistory()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (targetHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Target History</CardTitle>
          <CardDescription>No target history available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Set your nutrition targets to start tracking your progress over time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target History</CardTitle>
        <CardDescription>Track how your nutrition targets have changed over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calories">
          <TabsList className="mb-4">
            <TabsTrigger value="calories">Calories</TabsTrigger>
            <TabsTrigger value="protein">Protein</TabsTrigger>
          </TabsList>
          <TabsContent value="calories">
            <TargetHistoryChart data={targetHistory} type="calories" />
          </TabsContent>
          <TabsContent value="protein">
            <TargetHistoryChart data={targetHistory} type="protein" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
