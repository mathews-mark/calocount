import type React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"

interface TargetEntry {
  date: string
  calorieTarget: number
  proteinTarget: number
}

interface TargetHistoryChartProps {
  data: TargetEntry[]
  type: "calories" | "protein"
}

// Helper function to adjust for timezone offset - consistent with stats page
function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  // No longer adding an extra day
  return date
}

function groupDataByDate(data: TargetEntry[], type: "calories" | "protein") {
  const groupedData: { [key: string]: TargetEntry[] } = {}

  data.forEach((entry) => {
    // Use the date string directly for grouping
    const dateStr = entry.date
    if (!groupedData[dateStr]) {
      groupedData[dateStr] = []
    }
    groupedData[dateStr].push(entry)
  })

  return (
    Object.keys(groupedData)
      .map((date) => {
        const entries = groupedData[date]
        // Calculate the average for the selected type
        const value =
          type === "calories"
            ? entries.reduce((sum, entry) => sum + entry.calorieTarget, 0) / entries.length
            : entries.reduce((sum, entry) => sum + entry.proteinTarget, 0) / entries.length

        // Use adjustForTimezone for display formatting
        const adjustedDate = adjustForTimezone(date)
        return {
          date: format(adjustedDate, "MMM d"), // Format as "Jan 1"
          value,
          fullDate: date,
        }
      })
      // Sort by the actual date value, not the formatted string
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
  )
}

const TargetHistoryChart: React.FC<TargetHistoryChartProps> = ({ data, type }) => {
  const chartData = groupDataByDate(data, type)
  const color = type === "calories" ? "#8884d8" : "#82ca9d"
  const label = type === "calories" ? "Calorie Target" : "Protein Target (g)"

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${Math.round(Number(value))}${type === "calories" ? " kcal" : "g"}`, label]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line type="monotone" dataKey="value" name={label} stroke={color} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default TargetHistoryChart
