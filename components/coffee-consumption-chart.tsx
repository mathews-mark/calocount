"use client"

import type { Entry } from "@/types"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format, parseISO } from "date-fns"

interface CoffeeConsumptionChartProps {
  entries: Entry[]
}

// Helper function to adjust for timezone offset
function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  // No longer adding an extra day
  return date
}

// Helper function to extract coffee quantity from text
function extractCoffeeQuantity(text: string): number {
  const lowerText = text.toLowerCase()

  // Skip decaf coffee entries
  if (lowerText.includes("decaf") || lowerText.includes("decaffeinated")) {
    return 0
  }

  // Check for explicit quantities like "2 cups of coffee", "3 coffees"
  const explicitQuantityRegex = /(\d+)\s*(cups?|mugs?|shots?|espressos?|coffees?)/i
  const explicitMatch = lowerText.match(explicitQuantityRegex)
  if (explicitMatch) {
    return Number.parseInt(explicitMatch[1], 10)
  }

  // Check for size indicators that might imply quantity
  if (lowerText.includes("large coffee") || lowerText.includes("grande") || lowerText.includes("venti")) {
    return 2 // Count large coffees as 2 units
  }

  // Default to 1 if coffee is mentioned but no quantity is specified
  if (lowerText.includes("coffee") || lowerText.includes("espresso") || lowerText.includes("latte")) {
    return 1
  }

  return 0
}

export function CoffeeConsumptionChart({ entries }: CoffeeConsumptionChartProps) {
  // Filter entries that contain coffee in the meal name or notes
  // Exclude entries that contain "decaf" or "decaffeinated"
  const coffeeEntries = entries.filter((entry) => {
    const mealNameLower = entry.mealName.toLowerCase()
    const notesLower = entry.notes ? entry.notes.toLowerCase() : ""
    const fullText = mealNameLower + " " + notesLower

    // Skip if it contains decaf
    if (fullText.includes("decaf") || fullText.includes("decaffeinated")) {
      return false
    }

    // Include if it contains coffee-related terms
    return fullText.includes("coffee") || fullText.includes("espresso") || fullText.includes("latte")
  })

  // Group by date and sum coffee quantities
  const coffeeData = coffeeEntries.reduce((acc: Record<string, number>, entry) => {
    const date = entry.date // Use the date string directly
    const quantity = extractCoffeeQuantity(entry.mealName + " " + (entry.notes || ""))
    acc[date] = (acc[date] || 0) + quantity
    return acc
  }, {})

  // Convert to chart data format and sort chronologically by date
  const chartData = Object.entries(coffeeData)
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
          <Tooltip formatter={(value) => [`${value} cups`, "Coffee"]} labelFormatter={(label) => `Date: ${label}`} />
          <Legend />
          <Bar dataKey="quantity" name="Coffee Cups" fill="#8B4513" />
        </BarChart>
      </ResponsiveContainer>
      {chartData.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No coffee consumption data available for the selected period
        </div>
      )}
    </Card>
  )
}
