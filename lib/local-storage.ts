import type { CalorieEntry } from "@/types/calorie-entry"

const LOCAL_STORAGE_KEY = "calorieEntries"

export function getLocalEntries(): CalorieEntry[] {
  try {
    const savedEntries = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedEntries) {
      return JSON.parse(savedEntries) as CalorieEntry[]
    }
    return []
  } catch (error) {
    console.error("Error getting entries from local storage:", error)
    return []
  }
}

export function saveLocalEntry(entries: CalorieEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error("Error saving entries to local storage:", error)
  }
}
