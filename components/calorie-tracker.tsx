"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddFoodForm } from "@/components/add-food-form"
import { CalorieChart } from "@/components/calorie-chart"
import { CalorieGoalSettings } from "@/components/calorie-goal-settings"
import { getFoodEntries } from "@/lib/supabase-client"

export type FoodEntry = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  timestamp: Date
}

export default function CalorieTracker() {
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [calorieGoal, setCalorieGoal] = useState(2000)
  const [showSettings, setShowSettings] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    // First try to load from Supabase
    const loadFromSupabase = async () => {
      try {
        const { entries, error } = await getFoodEntries()
        if (entries.length > 0) {
          setEntries(entries)
          console.log("Loaded entries from Supabase:", entries.length)
        } else if (error) {
          console.warn("Failed to load from Supabase:", error)
          // Fall back to localStorage
          loadFromLocalStorage()
        } else {
          // No entries in Supabase, try localStorage
          loadFromLocalStorage()
        }
      } catch (error) {
        console.error("Error connecting to Supabase:", error)
        // Fall back to localStorage
        loadFromLocalStorage()
      }
    }

    const loadFromLocalStorage = () => {
      const savedEntries = localStorage.getItem("calorieEntries")
      if (savedEntries) {
        try {
          const parsedEntries = JSON.parse(savedEntries)
          // Convert string timestamps back to Date objects
          const entriesWithDates = parsedEntries.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))
          setEntries(entriesWithDates)
          console.log("Loaded entries from localStorage:", entriesWithDates.length)
        } catch (e) {
          console.error("Failed to parse saved entries", e)
        }
      }
    }

    loadFromSupabase()

    const savedGoal = localStorage.getItem("calorieGoal")
    if (savedGoal) {
      setCalorieGoal(Number.parseInt(savedGoal, 10))
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("calorieEntries", JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem("calorieGoal", calorieGoal.toString())
  }, [calorieGoal])

  const addEntry = (entry: FoodEntry) => {
    setEntries([...entries, entry])
  }

  const removeEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const updateCalorieGoal = (newGoal: number) => {
    setCalorieGoal(newGoal)
    setShowSettings(false)
  }

  // Filter entries for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp)
    entryDate.setHours(0, 0, 0, 0)
    return entryDate.getTime() === today.getTime()
  })

  // Calculate totals for today
  const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0)
  const totalProtein = todayEntries.reduce((sum, entry) => sum + entry.protein, 0)
  const totalCarbs = todayEntries.reduce((sum, entry) => sum + entry.carbs, 0)
  const totalFat = todayEntries.reduce((sum, entry) => sum + entry.fat, 0)

  // Calculate percentage of goal
  const caloriePercentage = Math.min(Math.round((totalCalories / calorieGoal) * 100), 100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calorie Tracker</h1>
          <p className="text-muted-foreground">Track your daily nutrition intake</p>
        </div>
        <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? "Cancel" : "Set Calorie Goal"}
        </Button>
      </div>

      {showSettings && <CalorieGoalSettings currentGoal={calorieGoal} onSave={updateCalorieGoal} />}

      <Card>
        <CardHeader>
          <CardTitle>Add Food Entry</CardTitle>
          <CardDescription>Enter the details of your food item</CardDescription>
        </CardHeader>
        <CardContent>
          <AddFoodForm onSubmit={addEntry} onCancel={() => {}} />
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <div className="rounded-full bg-primary/10 p-1">
              <span className="text-xs font-medium text-primary">
                {Math.round((totalCalories / calorieGoal) * 100)}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCalories} / {calorieGoal}
            </div>
            <Progress value={caloriePercentage} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProtein}g</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCarbs}g</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFat}g</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Food Log</CardTitle>
              <CardDescription>
                {todayEntries.length === 0
                  ? "You haven't logged any food today"
                  : `You've logged ${todayEntries.length} items today`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayEntries.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Click "Add Food" to start tracking your meals
                  </div>
                ) : (
                  todayEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">
                          P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-semibold">{entry.calories} cal</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Food History</CardTitle>
              <CardDescription>View your past food entries</CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No food entries found</div>
              ) : (
                <div className="space-y-4">
                  {/* Group entries by date */}
                  {Array.from(
                    new Set(
                      entries.map((entry) => {
                        const date = new Date(entry.timestamp)
                        return date.toDateString()
                      }),
                    ),
                  ).map((dateString) => (
                    <div key={dateString} className="space-y-2">
                      <h3 className="font-semibold">{dateString}</h3>
                      {entries
                        .filter((entry) => new Date(entry.timestamp).toDateString() === dateString)
                        .map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{entry.name}</div>
                              <div className="text-sm text-muted-foreground">
                                P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="font-semibold">{entry.calories} cal</div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEntry(entry.id)}
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calorie Intake</CardTitle>
              <CardDescription>Your calorie consumption over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <CalorieChart entries={entries} goal={calorieGoal} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
