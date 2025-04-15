/**
 * Global date utility functions for consistent date handling throughout the application
 * This module specifically addresses the one-day-off issue with dates
 */

/**
 * Formats a date as YYYY-MM-DD string
 * @param date Date object or date string to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === "object" ? date : new Date(date)
  return dateObj.toLocaleDateString("en-CA") // Returns YYYY-MM-DD format
}

/**
 * Formats a time as HH:MM string
 * @param date Date object or date string to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = typeof date === "object" ? date : new Date(date)
  return dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) // Returns HH:MM format
}

/**
 * Corrects the one-day-off issue by adding one day to the date
 * @param date Date object or date string to correct
 * @returns Corrected Date object
 */
export function correctDateOffset(date: Date | string | number): Date {
  const dateObj = typeof date === "object" ? new Date(date) : new Date(date)
  dateObj.setDate(dateObj.getDate() + 1)
  return dateObj
}

/**
 * Formats a date with the one-day correction applied
 * @param date Date object or date string to format with correction
 * @returns Formatted date string with correction applied
 */
export function formatCorrectedDate(date: Date | string | number): string {
  return formatDate(correctDateOffset(date))
}

/**
 * Parses a date string in YYYY-MM-DD format to a Date object
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  // Split the date string into components
  const [year, month, day] = dateString.split("-").map(Number)

  // Create a new date (months are 0-indexed in JavaScript)
  return new Date(year, month - 1, day)
}

/**
 * Combines a date string and time string into a single Date object
 * @param dateString Date string in YYYY-MM-DD format
 * @param timeString Time string in HH:MM format
 * @returns Combined Date object
 */
export function combineDateAndTime(dateString: string, timeString: string): Date {
  // Parse the date
  const [year, month, day] = dateString.split("-").map(Number)

  // Parse the time
  const [hours, minutes] = timeString.split(":").map(Number)

  // Create a new date object with both components
  return new Date(year, month - 1, day, hours, minutes)
}

/**
 * Extracts date and time from a photo file with correction for the one-day-off issue
 * @param file The uploaded photo file
 * @returns Promise resolving to an object with date and time strings
 */
export async function extractPhotoDateTime(file: File): Promise<{ date: string; time: string }> {
  return new Promise((resolve) => {
    try {
      // Default to current date and time
      const now = new Date()
      const defaultDate = formatDate(now)
      const defaultTime = formatTime(now)

      if (file && file.type.startsWith("image/")) {
        // Get the file's last modified timestamp
        const timestamp = file.lastModified
        const fileDate = new Date(timestamp)

        // Apply the one-day correction
        const correctedDate = correctDateOffset(fileDate)

        // Format the corrected date and the original time
        const formattedDate = formatDate(correctedDate)
        const formattedTime = formatTime(fileDate)

        resolve({
          date: formattedDate,
          time: formattedTime,
        })
      } else {
        // Not an image file or no file provided
        resolve({ date: defaultDate, time: defaultTime })
      }
    } catch (error) {
      console.error("Error in extractPhotoDateTime:", error)
      const now = new Date()
      resolve({
        date: formatDate(now),
        time: formatTime(now),
      })
    }
  })
}

/**
 * Converts a Date object to a string representation for API requests
 * @param date Date object to convert
 * @returns ISO string with the time portion removed
 */
export function dateToApiString(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Converts a date string from an API response to a Date object
 * @param dateString Date string from API
 * @returns Date object
 */
export function apiStringToDate(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Gets today's date as a string in YYYY-MM-DD format
 * @returns Today's date string
 */
export function getTodayString(): string {
  return formatDate(new Date())
}

/**
 * Gets the current time as a string in HH:MM format
 * @returns Current time string
 */
export function getCurrentTimeString(): string {
  return formatTime(new Date())
}
