"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Pencil, Trash2, AlertTriangle, CalendarIcon, ArrowRight } from "lucide-react"
import type { CalorieEntry } from "@/types/calorie-entry"
import { EditEntryForm } from "@/components/edit-entry-form"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export default function HistoryPage() {
  const [entries, setEntries] = useState<CalorieEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [targets, setTargets] = useState({ calorieTarget: 2000, proteinTarget: 190 })
  const [editingEntry, setEditingEntry] = useState<CalorieEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("entries")
  const [isAdjusting, setIsAdjusting] = useState<string | null>(null)

  // Date range states
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date())
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date())
  const [isCustomRange, setIsCustomRange] = useState(false)

  useEffect(() => {
    // Initialize with last 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    setCustomStartDate(thirtyDaysAgo)
    setCustomEndDate(today)

    fetchEntries(thirtyDaysAgo, today)
    fetchTargets()
  }, [])

  // Update the fetchTargets function to be more robust and add more detailed debugging
  const fetchTargets = async () => {
    try {
      console.log("Fetching targets from API...")
      const response = await fetch("/api/targets")
      const data = await response.json()
      console.log("Raw API response:", JSON.stringify(data))

      if (data.success && data.targets) {
        console.log("Target data from API:", JSON.stringify(data.targets))

        // Extract the target values directly, with more detailed logging
        const calorieTarget = Number(data.targets.calorieTarget)
        const proteinTarget = Number(data.targets.proteinTarget)

        console.log("Extracted calorie target (number):", calorieTarget)
        console.log("Extracted protein target (number):", proteinTarget)

        // Make sure we're using the same approach for both targets
        if (!isNaN(calorieTarget) && !isNaN(proteinTarget)) {
          console.log("Setting targets state with valid numbers")
          setTargets({
            calorieTarget: calorieTarget,
            proteinTarget: proteinTarget,
          })

          console.log("Updated targets state:", {
            calorieTarget: calorieTarget,
            proteinTarget: proteinTarget,
          })
        } else {
          console.warn("Invalid target values, using defaults")
          setTargets({
            calorieTarget: isNaN(calorieTarget) ? 2000 : calorieTarget,
            proteinTarget: isNaN(proteinTarget) ? 190 : proteinTarget,
          })
        }
      } else {
        console.warn("API response did not contain target data:", data)
      }
    } catch (error) {
      console.error("Error fetching targets:", error)
    }
  }

  const fetchEntries = async (startDate: Date, endDate: Date) => {
    setIsLoading(true)

    try {
      // Format dates for API
      const formattedStartDate = format(startDate, "yyyy-MM-dd")
      const formattedEndDate = format(endDate, "yyyy-MM-dd")

      const response = await fetch(`/api/entries?startDate=${formattedStartDate}&endDate=${formattedEndDate}`)
      const data = await response.json()

      if (data.success) {
        setEntries(data.entries)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply custom date range
  const applyCustomDateRange = () => {
    setIsCustomRange(true)
    fetchEntries(customStartDate, customEndDate)
  }

  // Reset to default 30 days
  const resetDateRange = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    setCustomStartDate(thirtyDaysAgo)
    setCustomEndDate(today)
    setIsCustomRange(false)

    fetchEntries(thirtyDaysAgo, today)
  }

  // Fix the issue with edit entry not saving changes
  // Update the handleEntryUpdate function to properly update the entries state
  const handleEntryUpdate = (updatedEntry: CalorieEntry) => {
    console.log("Updating entry:", updatedEntry)
    // Create a new array with the updated entry
    const updatedEntries = entries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))

    // Update the state with the new array
    setEntries(updatedEntries)

    // Close the edit modal
    setIsEditModalOpen(false)

    // Show success toast
    toast({
      title: "Entry updated",
      description: "Your food entry has been updated successfully.",
    })
  }

  // Add this function to handle entry deletion
  const handleEntryDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  // Update the adjustDailyCalories function to properly calculate net calories
  // and not use Supabase

  // Replace the existing adjustDailyCalories function with this updated version:
  const adjustDailyCalories = async (date: string, adjustment: number) => {
    try {
      setIsAdjusting(date)

      // Calculate the current daily total calories
      const dailyTotal = getDailyTotals()[date]?.calories || 0

      // Calculate the adjusted target (base target + adjustment)
      const adjustedTarget = targets.calorieTarget + adjustment

      // Calculate how many additional calories are needed to reach the adjusted target
      const additionalCaloriesNeeded = adjustedTarget - dailyTotal

      if (additionalCaloriesNeeded <= 0) {
        toast({
          title: "Cannot adjust calories",
          description: "The adjustment would result in zero or negative additional calories.",
          variant: "destructive",
        })
        setIsAdjusting(null)
        return
      }

      // Call the API to add the adjustment
      const response = await fetch("/api/adjust-calories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          adjustment,
          targetCalories: additionalCaloriesNeeded, // Only add the difference needed
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Calories adjusted",
          description: `Added ${additionalCaloriesNeeded} calories to reach ${adjustedTarget} total calories for the day.`,
        })

        // Refresh entries to show the new adjustment
        await fetchEntries(customStartDate, customEndDate)
      } else {
        toast({
          title: "Adjustment failed",
          description: data.error || "Failed to adjust calories",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adjusting daily calories:", error)
      toast({
        title: "Adjustment failed",
        description: "An error occurred while adjusting calories",
        variant: "destructive",
      })
    } finally {
      setIsAdjusting(null)
    }
  }

  // Helper function to adjust for timezone offset - consistent with stats page
  function adjustForTimezone(dateString: string): Date {
    // Parse the date string to a Date object
    const date = parseISO(dateString)
    return date
  }

  // Group entries by date
  const entriesByDate = entries.reduce(
    (acc, entry) => {
      // Use adjustForTimezone to ensure consistent date handling
      const date = adjustForTimezone(entry.date)
      const dateString = date.toDateString()

      if (!acc[dateString]) {
        acc[dateString] = []
      }
      acc[dateString].push(entry)
      return acc
    },
    {} as Record<string, CalorieEntry[]>,
  )

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Calculate daily totals
  const getDailyTotals = () => {
    const dailyTotals: Record<
      string,
      {
        date: string
        calories: number
        protein: number
        isBelowTarget: boolean
      }
    > = {}

    // Group entries by date and sum calories and protein
    entries.forEach((entry) => {
      // Use adjustForTimezone to ensure consistent date handling
      const date = adjustForTimezone(entry.date)
      const dateString = date.toDateString()

      if (!dailyTotals[dateString]) {
        dailyTotals[dateString] = {
          date: entry.date,
          calories: 0,
          protein: 0,
          isBelowTarget: false,
        }
      }
      dailyTotals[dateString].calories += entry.calories
      dailyTotals[dateString].protein += entry.protein
    })

    // Check which days are below target
    Object.keys(dailyTotals).forEach((date) => {
      dailyTotals[date].isBelowTarget = targets.calorieTarget - dailyTotals[date].calories >= 300
    })

    return dailyTotals
  }

  const dailyTotals = getDailyTotals()
  const sortedDailyTotals = Object.values(dailyTotals).sort((a, b) => {
    // Use adjustForTimezone to ensure consistent date handling
    const dateA = adjustForTimezone(a.date)
    const dateB = adjustForTimezone(b.date)
    return dateB.getTime() - dateA.getTime()
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your history...</span>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">History</h1>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {format(customStartDate, "MMM d, yyyy")} - {format(customEndDate, "MMM d, yyyy")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Select Date Range</h4>
                      <p className="text-xs text-muted-foreground">Choose start and end dates for your history view</p>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col sm:flex-row gap-2">
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium">Start Date</h4>
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={(date) => date && setCustomStartDate(date)}
                        disabled={(date) => date > customEndDate || date > new Date()}
                        initialFocus
                      />
                    </div>
                    <div className="hidden sm:flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium">End Date</h4>
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={(date) => date && setCustomEndDate(date)}
                        disabled={(date) => date < customStartDate || date > new Date()}
                        initialFocus
                      />
                    </div>
                  </div>
                  <div className="p-3 border-t flex justify-between">
                    <Button variant="outline" onClick={resetDateRange}>
                      Reset to 30 Days
                    </Button>
                    <Button onClick={applyCustomDateRange}>Apply Range</Button>
                  </div>
                </PopoverContent>
              </Popover>

              {isCustomRange && (
                <Button variant="ghost" size="sm" onClick={resetDateRange}>
                  Reset
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">{entries.length} entries found</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="entries" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="entries">Meal Entries</TabsTrigger>
          <TabsTrigger value="dailyTotals">Daily Totals</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          {sortedDates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No entries found for this time period</p>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map((dateString) => (
              <Card key={dateString}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{format(new Date(dateString), "EEEE, MMMM d, yyyy")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {entriesByDate[dateString].map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{entry.mealName}</div>
                        <div className="text-sm text-muted-foreground">
                          P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                        </div>
                        <div className="text-xs text-muted-foreground">{entry.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{entry.calories} cal</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEntry(entry)
                            setIsEditModalOpen(true)
                          }}
                          className="text-primary hover:text-primary/90 hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEntryDelete(entry.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="dailyTotals" className="space-y-6">
          {sortedDailyTotals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No entries found for this time period</p>
              </CardContent>
            </Card>
          ) : (
            sortedDailyTotals.map((daily) => (
              <Card key={daily.date} className={daily.isBelowTarget ? "border-destructive" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {format(adjustForTimezone(daily.date), "EEEE, MMMM d, yyyy")}
                      {daily.isBelowTarget && <AlertTriangle className="h-5 w-5 text-destructive" />}
                    </CardTitle>
                    <div className="text-lg font-bold">
                      {daily.calories} / {targets.calorieTarget} cal
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Protein: {daily.protein}g / {targets.proteinTarget}g
                        </p>
                        {daily.isBelowTarget && (
                          <p className="text-sm text-destructive mt-1">
                            {targets.calorieTarget - daily.calories} calories below target
                          </p>
                        )}
                      </div>

                      {daily.isBelowTarget && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustDailyCalories(daily.date, -250)}
                            disabled={isAdjusting === daily.date}
                          >
                            {isAdjusting === daily.date ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Net: {targets.calorieTarget - 250}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustDailyCalories(daily.date, 0)}
                            disabled={isAdjusting === daily.date}
                          >
                            {isAdjusting === daily.date ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Net: {targets.calorieTarget}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustDailyCalories(daily.date, 250)}
                            disabled={isAdjusting === daily.date}
                          >
                            {isAdjusting === daily.date ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Net: {targets.calorieTarget + 250}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustDailyCalories(daily.date, 500)}
                            disabled={isAdjusting === daily.date}
                          >
                            {isAdjusting === daily.date ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Net: {targets.calorieTarget + 500}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustDailyCalories(daily.date, 750)}
                            disabled={isAdjusting === daily.date}
                          >
                            {isAdjusting === daily.date ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Net: {targets.calorieTarget + 750}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustDailyCalories(daily.date, 1000)}
                            disabled={isAdjusting === daily.date}
                          >
                            {isAdjusting === daily.date ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Net: {targets.calorieTarget + 1000}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <EditEntryForm
        entry={editingEntry}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleEntryUpdate}
        onDelete={handleEntryDelete}
      />
    </div>
  )
}

function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  return date
}
