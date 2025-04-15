import type { CalorieEntry } from "@/types/calorie-entry"

// This is a browser-safe version of the Google Sheets integration
// It doesn't use any Node.js-specific modules and only makes API calls to our own endpoints

// Get all entries from the API
export async function getAllEntriesBrowserSafe(): Promise<CalorieEntry[]> {
  try {
    const response = await fetch("/api/entries")
    const data = await response.json()

    if (data.success) {
      return data.entries
    }

    return []
  } catch (error) {
    console.error("Error getting entries:", error)
    return []
  }
}

// Get entries for a specific date range from the API
export async function getEntriesForDateRangeBrowserSafe(startDate: string, endDate: string): Promise<CalorieEntry[]> {
  try {
    const response = await fetch(`/api/entries?startDate=${startDate}&endDate=${endDate}`)
    const data = await response.json()

    if (data.success) {
      return data.entries
    }

    return []
  } catch (error) {
    console.error("Error getting entries for date range:", error)
    return []
  }
}

// Add a new entry via the API
export async function addEntryBrowserSafe(entry: CalorieEntry): Promise<boolean> {
  try {
    const response = await fetch("/api/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error adding entry:", error)
    return false
  }
}
