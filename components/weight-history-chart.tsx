import type React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"

interface WeightEntry {
  date: string
  weight: number
}

interface WeightHistoryChartProps {
  data: WeightEntry[]
}

// Helper function to adjust for timezone offset - consistent with stats page
function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  // No longer adding an extra day
  return date
}

function groupDataByDate(data: WeightEntry[]) {
  const groupedData: { [key: string]: WeightEntry[] } = {}

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
        // Use adjustForTimezone for display formatting
        const adjustedDate = adjustForTimezone(date)
        return {
          date: format(adjustedDate, "MMM dd"), // Format as "Jan 1"
          weight: entries.reduce((sum, entry) => sum + entry.weight, 0) / entries.length,
          fullDate: date,
        }
      })
      // Sort by the actual date value, not the formatted string
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
  )
}

const WeightHistoryChart: React.FC<WeightHistoryChartProps> = ({ data }) => {
  const chartData = groupDataByDate(data)

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
        <Tooltip formatter={(value) => [`${value} lbs`, "Weight"]} labelFormatter={(label) => `Date: ${label}`} />
        <Legend />
        <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default WeightHistoryChart
