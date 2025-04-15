"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import type { StravaActivity } from "@/types/strava"

export function StravaActivities() {
  const [activities, setActivities] = useState<StravaActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/strava/activities")

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setActivities(data.activities || [])
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError(err instanceof Error ? err.message : "Failed to load activities")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Function to format duration (seconds to HH:MM:SS)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            <p className="font-medium">Error loading activities</p>
            <p>{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities found. Start tracking your workouts on Strava!
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="run">Runs</TabsTrigger>
              <TabsTrigger value="ride">Rides</TabsTrigger>
              <TabsTrigger value="swim">Swims</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                />
              ))}
            </TabsContent>

            <TabsContent value="run" className="space-y-4">
              {activities
                .filter((activity) => activity.type === "Run")
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    formatDate={formatDate}
                    formatDuration={formatDuration}
                  />
                ))}
            </TabsContent>

            <TabsContent value="ride" className="space-y-4">
              {activities
                .filter((activity) => activity.type === "Ride")
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    formatDate={formatDate}
                    formatDuration={formatDuration}
                  />
                ))}
            </TabsContent>

            <TabsContent value="swim" className="space-y-4">
              {activities
                .filter((activity) => activity.type === "Swim")
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    formatDate={formatDate}
                    formatDuration={formatDuration}
                  />
                ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

interface ActivityCardProps {
  activity: StravaActivity
  formatDate: (dateString: string) => string
  formatDuration: (seconds: number) => string
}

function ActivityCard({ activity, formatDate, formatDuration }: ActivityCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{activity.name}</h3>
          <p className="text-sm text-muted-foreground">{formatDate(activity.start_date)}</p>
        </div>
        <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">{activity.type}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
        <div>
          <p className="text-muted-foreground">Distance</p>
          <p className="font-medium">{(activity.distance / 1000).toFixed(2)} km</p>
        </div>
        <div>
          <p className="text-muted-foreground">Duration</p>
          <p className="font-medium">{formatDuration(activity.moving_time)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Calories</p>
          <p className="font-medium">{activity.calories || "N/A"}</p>
        </div>
      </div>
    </div>
  )
}
