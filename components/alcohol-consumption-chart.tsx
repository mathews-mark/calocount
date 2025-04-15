"use client"

import type { Entry } from "@/types"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format, parseISO } from "date-fns"

interface AlcoholConsumptionChartProps {
  entries: Entry[]
}

// Helper function to adjust for timezone offset
function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  // No longer adding an extra day
  return date
}

// Helper function to check if an entry is non-alcoholic
function isNonAlcoholic(text: string): boolean {
  const lowerText = text.toLowerCase()
  const nonAlcoholicTerms = [
    "non-alcoholic",
    "non alcoholic",
    "alcohol-free",
    "alcohol free",
    "0%",
    "0 %",
    "zero alcohol",
    "mocktail",
    "virgin",
  ]

  return nonAlcoholicTerms.some((term) => lowerText.includes(term))
}

// Helper function to extract alcohol quantity from text
function extractAlcoholQuantity(text: string): number {
  const lowerText = text.toLowerCase()

  // Skip non-alcoholic drinks
  if (isNonAlcoholic(lowerText)) {
    return 0
  }

  // Check for explicit quantities like "2 beers", "3 glasses of wine"
  const explicitQuantityRegex = /(\d+)\s*(beers?|wines?|glasses?|shots?|drinks?|cocktails?)/i
  const explicitMatch = lowerText.match(explicitQuantityRegex)
  if (explicitMatch) {
    return Number.parseInt(explicitMatch[1], 10)
  }

  // Check for specific alcohol types
  const alcoholTypes = [
    "beer",
    "wine",
    "cocktail",
    "whiskey",
    "vodka",
    "gin",
    "rum",
    "tequila",
    "bourbon",
    "scotch",
    "martini",
    "margarita",
  ]

  for (const type of alcoholTypes) {
    if (lowerText.includes(type)) {
      // For "bottle of wine" count as 5 drinks
      if (type === "wine" && lowerText.includes("bottle")) {
        return 5
      }
      // Default to 1 if alcohol is mentioned but no quantity is specified
      return 1
    }
  }

  // Check for general "drink" or "alcohol" mentions
  if (lowerText.includes("drink") || lowerText.includes("alcohol")) {
    return 1
  }

  return 0
}

export function AlcoholConsumptionChart({ entries }: AlcoholConsumptionChartProps) {
  // Filter entries that contain alcohol-related keywords in the meal name or notes
  // But exclude non-alcoholic drinks
  const alcoholKeywords = [
    "beer",
    "wine",
    "cocktail",
    "alcohol",
    "drink",
    "whiskey",
    "vodka",
    "gin",
    "rum",
    "tequila",
    "bourbon",
    "scotch",
    "martini",
    "margarita",
  ]

  const alcoholEntries = entries.filter((entry) => {
    const mealNameLower = entry.mealName.toLowerCase()
    const notesLower = entry.notes ? entry.notes.toLowerCase() : ""
    const fullText = mealNameLower + " " + notesLower

    // Skip if it's non-alcoholic
    if (isNonAlcoholic(fullText)) {
      return false
    }

    return alcoholKeywords.some((keyword) => fullText.includes(keyword))
  })

  // Group by date and sum alcohol quantities
  const alcoholData = alcoholEntries.reduce((acc: Record<string, number>, entry) => {
    const date = entry.date // Use the date string directly
    const quantity = extractAlcoholQuantity(entry.mealName + " " + (entry.notes || ""))
    acc[date] = (acc[date] || 0) + quantity
    return acc
  }, {})

  // Convert to chart data format and sort chronologically by date
  const chartData = Object.entries(alcoholData)
    .map(([date, quantity]) => {
      // Adjust for timezone and format the date
      const adjustedDate = adjustForTimezone(date)
      return {
        date: format(adjustedDate, "MMM d"), // Format as "Jan 1"
        quantity,
        fullDate: date,
      }
    })
    // Sort by the actual date value, not the formatted string
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => [`${value} drinks`, "Alcohol"]} labelFormatter={(label) => `Date: ${label}`} />
          <Legend />
          <Bar dataKey="quantity" name="Alcoholic Drinks" fill="#8E44AD" />
        </BarChart>
      </ResponsiveContainer>
      {chartData.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No alcohol consumption data available for the selected period
        </div>
      )}
    </Card>
  )
}
