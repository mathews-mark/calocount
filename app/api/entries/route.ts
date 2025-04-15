import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { CalorieEntry } from "@/types/calorie-entry"
import { addEntryToSheet, getEntriesForDateRange, getAllEntries, initializeSpreadsheet } from "@/lib/google-sheets"

// In-memory storage for entries as fallback
const inMemoryEntries: CalorieEntry[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let entries: CalorieEntry[] = []

    // Try to get entries from Google Sheets
    try {
      // Make sure the spreadsheet is initialized
      await initializeSpreadsheet()

      if (startDate && endDate) {
        entries = await getEntriesForDateRange(startDate, endDate)
      } else {
        entries = await getAllEntries()
      }
      console.log(`Retrieved ${entries.length} entries from Google Sheets`)
    } catch (googleError) {
      console.error("Error fetching from Google Sheets, using in-memory fallback:", googleError)

      // Fallback to in-memory storage
      entries = inMemoryEntries

      if (startDate && endDate) {
        // Filter entries by date range
        entries = entries.filter((entry) => {
          const entryDate = new Date(entry.date)
          const start = new Date(startDate)
          const end = new Date(endDate)

          // Set time to midnight for accurate date comparison
          entryDate.setHours(0, 0, 0, 0)
          start.setHours(0, 0, 0, 0)
          end.setHours(0, 0, 0, 0)

          return entryDate >= start && entryDate <= end
        })
      }
    }

    return NextResponse.json({ success: true, entries })
  } catch (error) {
    console.error("Error fetching entries:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch entries" }, { status: 500 })
  }
}

// Update the POST handler to use the date and time from the request without modification when no photo is involved

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("Received entry data:", data)

    // Create the entry with the provided date and time
    // Only adjust timezone if needed (e.g., for programmatic date creation)
    const entry: CalorieEntry = {
      id: data.id || uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    }

    // Try to add to Google Sheets
    try {
      // Make sure the spreadsheet is initialized first
      await initializeSpreadsheet()

      await addEntryToSheet(entry)
      console.log("Entry added to Google Sheets successfully")
    } catch (googleError) {
      console.error("Error adding to Google Sheets, using in-memory fallback:", googleError)
      // Add to in-memory storage as fallback
      inMemoryEntries.push(entry)
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Error adding entry:", error)
    return NextResponse.json({ success: false, error: "Failed to add entry" }, { status: 500 })
  }
}
