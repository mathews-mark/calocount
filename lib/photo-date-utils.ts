/**
 * Re-export functions from the global date utility module
 * This maintains backward compatibility with existing code
 */

import { extractPhotoDateTime, formatDate as formatDateForInput, correctDateOffset } from "./date-utils"

interface PhotoDateTime {
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
}

/**
 * Adjusts a date string for the user's local timezone
 * @param dateString ISO date string or Date object
 * @returns Date string adjusted for local timezone
 */
export function adjustDateForTimezone(dateInput: string | Date): string {
  // Use the global utility function to correct the date
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const correctedDate = correctDateOffset(date)
  return formatDateForInput(correctedDate)
}

/**
 * Gets a timezone-adjusted date string from a Date object
 * @param inputDate Date object to adjust
 * @returns Timezone-adjusted date string in YYYY-MM-DD format
 */
export function getTimezoneAdjustedDate(inputDate: Date): string {
  // Use the global utility function to correct the date
  const correctedDate = correctDateOffset(inputDate)
  return formatDateForInput(correctedDate)
}

// Re-export the extractPhotoDateTime function
export { extractPhotoDateTime }
