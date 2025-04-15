"use client"

import { useState, useEffect } from "react"
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2, AlertCircle, CalendarIcon, ArrowRight } from "lucide-react"
import type { CalorieEntry, MealSuggestion } from "@/types/calorie-entry"
import { getMostPopularMeals } from "@/lib/string-similarity"
import { MobileLink } from "@/components/mobile-link"
import { CoffeeConsumptionChart } from "./coffee-consumption-chart"
import { AlcoholConsumptionChart } from "./alcohol-consumption-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type TimeRange = "7days" | "14days" | "1month" | "calendaryear" | "pastyear" | "custom"

// Fallback targets in case the API fails
const FALLBACK_TARGETS = {
  calorieTarget: 2700,
  proteinTarget: 170,
}

// Helper function to adjust for timezone offset
function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  // No longer adding an extra day
  return date
}

export function StatsView() {
  const [entries, setEntries] = useState<CalorieEntry[]>([])
  const [popularMeals, setPopularMeals] = useState<MealSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>("7days")
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [targets, setTargets] = useState(FALLBACK_TARGETS)
  const [targetError, setTargetError] = useState<string | null>(null)
  const [targetSource, setTargetSource] = useState<string>("loading")

  // Custom date range states
  const [customStartDate, setCustomStartDate] = useState<Date>(subDays(new Date(), 30))
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date())

  const getFilteredEntries = (entries: CalorieEntry[], timeRange: TimeRange): CalorieEntry[] => {
    const now = new Date()
    const filtered = entries.filter((entry) => {
      // Adjust the entry date for timezone
      const entryDate = adjustForTimezone(entry.date)

      switch (timeRange) {
        case "7days":
          const sevenDaysAgo = new Date(now)
          sevenDaysAgo.setDate(now.getDate() - 7)
          return entryDate >= sevenDaysAgo
        case "14days":
          const fourteenDaysAgo = new Date(now)
          fourteenDaysAgo.setDate(now.getDate() - 14)
          return entryDate >= fourteenDaysAgo
        case "1month":
          const oneMonthAgo = new Date(now)
          oneMonthAgo.setMonth(now.getMonth() - 1)
          return entryDate >= oneMonthAgo
        case "calendaryear":
          const startOfYear = new Date(now.getFullYear(), 0, 1) // January 1st of current year
          return entryDate >= startOfYear
        case "pastyear":
          const oneYearAgo = new Date(now)
          oneYearAgo.setFullYear(now.getFullYear() - 1)
          return entryDate >= oneYearAgo
        case "custom":
          // Use the custom date range
          return entryDate >= startOfDay(customStartDate) && entryDate <= endOfDay(customEndDate)
        default:
          return true
      }
    })

    return filtered
  }

  useEffect(() => {
    fetchEntries()
    fetchSpreadsheetUrl()
    fetchTargets()
  }, [timeRange, customStartDate, customEndDate])

  const fetchTargets = async () => {
    // Try multiple approaches to get the targets
    setTargetError(null)

    try {
      // First approach: Use the API
      console.log("Fetching targets from API...")
      const apiResponse = await fetch("/api/targets")
      const apiData = await apiResponse.json()

      if (apiData.success && apiData.targets) {
        console.log("API targets:", apiData.targets)

        // Validate the targets
        const calorieTarget = Number(apiData.targets.calorieTarget)
        const proteinTarget = Number(apiData.targets.proteinTarget)

        if (!isNaN(calorieTarget) && !isNaN(proteinTarget)) {
          setTargets({
            calorieTarget,
            proteinTarget,
          })
          setTargetSource("api")
          console.log("Using targets from API:", { calorieTarget, proteinTarget })
          return
        } else {
          console.warn("Invalid targets from API:", apiData.targets)
        }
      } else {
        console.warn("API response unsuccessful:", apiData)
      }

      // If we get here, the API approach failed
      // Try to get from localStorage as a fallback
      const storedTargets = localStorage.getItem("calorieTargets")
      if (storedTargets) {
        try {
          const parsedTargets = JSON.parse(storedTargets)
          if (
            parsedTargets &&
            typeof parsedTargets.calorieTarget === "number" &&
            typeof parsedTargets.proteinTarget === "number"
          ) {
            setTargets(parsedTargets)
            setTargetSource("localStorage")
            console.log("Using targets from localStorage:", parsedTargets)
            return
          }
        } catch (e) {
          console.warn("Error parsing stored targets:", e)
        }
      }

      // If all else fails, use the fallback
      setTargets(FALLBACK_TARGETS)
      setTargetSource("fallback")
      console.log("Using fallback targets:", FALLBACK_TARGETS)
    } catch (error) {
      console.error("Error fetching targets:", error)
      setTargetError(error instanceof Error ? error.message : "Unknown error")

      // Use fallback if there's an error
      setTargets(FALLBACK_TARGETS)
      setTargetSource("fallback")
    }
  }

  // Save targets to localStorage whenever they change
  useEffect(() => {
    if (targetSource !== "loading") {
      localStorage.setItem("calorieTargets", JSON.stringify(targets))
    }
  }, [targets, targetSource])

  const fetchEntries = async () => {
    setIsLoading(true)

    try {
      // Calculate date range based on selected time range
      let endDate: string
      let startDate: string

      if (timeRange === "custom") {
        // Use custom date range
        startDate = format(startOfDay(customStartDate), "yyyy-MM-dd")
        endDate = format(endOfDay(customEndDate), "yyyy-MM-dd")
      } else {
        // Use preset date ranges
        endDate = format(endOfDay(new Date()), "yyyy-MM-dd")

        if (timeRange === "7days") {
          startDate = format(startOfDay(subDays(new Date(), 6)), "yyyy-MM-dd")
        } else if (timeRange === "14days") {
          startDate = format(startOfDay(subDays(new Date(), 13)), "yyyy-MM-dd")
        } else if (timeRange === "1month") {
          startDate = format(startOfDay(subDays(new Date(), 29)), "yyyy-MM-dd")
        } else if (timeRange === "calendaryear") {
          const startOfThisYear = new Date(new Date().getFullYear(), 0, 1) // January 1st of current year
          startDate = format(startOfDay(startOfThisYear), "yyyy-MM-dd")
        } else if (timeRange === "pastyear") {
          startDate = format(startOfDay(subDays(new Date(), 364)), "yyyy-MM-dd")
        } else {
          startDate = format(startOfDay(subDays(new Date(), 29)), "yyyy-MM-dd")
        }
      }

      // Fetch entries for the date range
      const response = await fetch(`/api/entries?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()

      if (data.success) {
        setEntries(data.entries)

        // Calculate popular meals
        const popular = getMostPopularMeals(data.entries, 5)
        setPopularMeals(popular)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSpreadsheetUrl = async () => {
    setIsLoadingUrl(true)

    try {
      const response = await fetch("/api/spreadsheet-url")
      const data = await response.json()

      if (data.success) {
        setSpreadsheetUrl(data.url)
      }
    } catch (error) {
      console.error("Error fetching spreadsheet URL:", error)
    } finally {
      setIsLoadingUrl(false)
    }
  }

  // Update the getTargetComparisonData function to sort dates chronologically
  const getTargetComparisonData = () => {
    const dailyTotals: Record<string, { date: string; calories: number; protein: number }> = {}

    // Group entries by date and sum calories and protein
    entries.forEach((entry) => {
      const date = entry.date
      if (!dailyTotals[date]) {
        // Adjust for timezone and format the date
        const adjustedDate = adjustForTimezone(date)
        dailyTotals[date] = {
          date: format(adjustedDate, "MMM d"), // Format as "Jan 1"
          calories: 0,
          protein: 0,
        }
      }
      dailyTotals[date].calories += entry.calories
      dailyTotals[date].protein += entry.protein
    })

    // Convert to arrays for charts and sort by actual date (not formatted string)
    const caloriesData = Object.entries(dailyTotals)
      .map(([dateStr, { date, calories }]) => ({
        date,
        actual: calories,
        target: targets.calorieTarget,
        // Store the original date string for proper sorting
        originalDate: dateStr,
      }))
      .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())

    const proteinData = Object.entries(dailyTotals)
      .map(([dateStr, { date, protein }]) => ({
        date,
        actual: protein,
        target: targets.proteinTarget,
        // Store the original date string for proper sorting
        originalDate: dateStr,
      }))
      .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())

    return { caloriesData, proteinData }
  }

  const { caloriesData, proteinData } = getTargetComparisonData()
  const filteredEntries = getFilteredEntries(entries, timeRange)

  // Get the display text for the current time range
  const getTimeRangeDisplayText = () => {
    switch (timeRange) {
      case "7days":
        return "7 Days"
      case "14days":
        return "14 Days"
      case "1month":
        return "Past Month"
      case "calendaryear":
        return "Calendar Year"
      case "pastyear":
        return "Past Year"
      case "custom":
        return `${format(customStartDate, "MMM d, yyyy")} - ${format(customEndDate, "MMM d, yyyy")}`
      default:
        return "Custom Range"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your stats...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {targetError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading targets</AlertTitle>
          <AlertDescription>{targetError}. Using fallback values.</AlertDescription>
        </Alert>
      )}

      {targetSource === "fallback" && !targetError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Using default targets</AlertTitle>
          <AlertDescription>
            Could not load your custom targets. Using default values: {targets.calorieTarget} calories and{" "}
            {targets.proteinTarget}g protein.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={timeRange === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7days")}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === "14days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("14days")}
          >
            14 Days
          </Button>
          <Button
            variant={timeRange === "1month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("1month")}
          >
            Past Month
          </Button>
          <Button
            variant={timeRange === "calendaryear" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("calendaryear")}
          >
            Calendar Year
          </Button>
          <Button
            variant={timeRange === "pastyear" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("pastyear")}
          >
            Past Year
          </Button>

          {/* Custom Date Range Selector */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={timeRange === "custom" ? "default" : "outline"}
                  size="sm"
                  className={cn("justify-start text-left font-normal", !customStartDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {timeRange === "custom" ? getTimeRangeDisplayText() : "Custom Range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Select Date Range</h4>
                    <p className="text-xs text-muted-foreground">Choose start and end dates for your custom range</p>
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
                <div className="p-3 border-t">
                  <Button className="w-full" onClick={() => setTimeRange("custom")}>
                    Apply Range
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          {spreadsheetUrl &&
            (isLoadingUrl ? (
              <Button variant="outline" size="sm" disabled className="w-full sm:w-auto mt-2 sm:mt-0">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : (
              <MobileLink href={spreadsheetUrl} className="w-full sm:w-auto mt-2 sm:mt-0">
                See Google Sheet Data
              </MobileLink>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Target vs. Actual Calories Chart - Changed to LineChart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Calories: Target vs. Actual</CardTitle>
            <CardDescription>
              Compare your daily calorie intake to your target ({targets.calorieTarget})
              {targetSource !== "api" && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Using {targetSource === "localStorage" ? "locally stored" : "default"} target)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={caloriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Target vs. Actual Protein Chart - Changed to LineChart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Protein: Target vs. Actual</CardTitle>
            <CardDescription>
              Compare your daily protein intake to your target ({targets.proteinTarget}g)
              {targetSource !== "api" && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Using {targetSource === "localStorage" ? "locally stored" : "default"} target)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={proteinData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <CoffeeConsumptionChart entries={filteredEntries} />
        <AlcoholConsumptionChart entries={filteredEntries} />

        {/* Popular Meals Card */}
        <PopularMealsCard
          meals={popularMeals}
          timeRange={
            timeRange === "custom"
              ? `${format(customStartDate, "MMM d")} - ${format(customEndDate, "MMM d")}`
              : timeRange === "7days"
                ? "7 days"
                : timeRange === "14days"
                  ? "14 days"
                  : timeRange === "1month"
                    ? "1 month"
                    : timeRange === "calendaryear"
                      ? "Calendar Year"
                      : "Past Year"
          }
        />
      </div>
    </div>
  )
}

interface PopularMealsCardProps {
  meals: MealSuggestion[]
  timeRange: string
}

function PopularMealsCard({ meals, timeRange }: PopularMealsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Popular Meals (Last {timeRange})</CardTitle>
      </CardHeader>
      <CardContent>
        {meals.length === 0 ? (
          <p className="text-muted-foreground">No meals logged in this period</p>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.mealName} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">{meal.mealName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                  </p>
                  {meal.similarNames.length > 1 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Similar names: {meal.similarNames.slice(0, 3).join(", ")}
                      {meal.similarNames.length > 3 && "..."}
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold">{meal.frequency}x</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
