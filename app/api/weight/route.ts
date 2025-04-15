import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { addWeightEntryToSheet, getAllWeightEntries, initializeSpreadsheet } from "@/lib/google-sheets"
import { format } from "date-fns"

// In-memory storage for weight entries as fallback
const inMemoryWeightEntries: any[] = []

export async function GET() {
  try {
    let entries = []

    // Try to get entries from Google Sheets
    try {
      // Make sure the spreadsheet is initialized
      await initializeSpreadsheet()

      entries = await getAllWeightEntries()
      console.log(`Retrieved ${entries.length} weight entries from Google Sheets`)
    } catch (googleError) {
      console.error("Error fetching from Google Sheets, using in-memory fallback:", googleError)
      // Fallback to in-memory storage
      entries = inMemoryWeightEntries
    }

    return NextResponse.json({ success: true, entries })
  } catch (error) {
    console.error("Error fetching weight entries:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch weight entries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("Received weight entry data:", data)

    // Generate a unique ID if not provided
    const entry = {
      id: data.id || uuidv4(),
      date: data.date,
      time: data.time || format(new Date(), "HH:mm"), // Default to current time if not provided
      weight: data.weight,
      notes: data.notes || "",
    }

    // Try to add to Google Sheets
    try {
      // Make sure the spreadsheet is initialized first
      await initializeSpreadsheet()

      await addWeightEntryToSheet(entry)
      console.log("Weight entry added to Google Sheets successfully")
    } catch (googleError) {
      console.error("Error adding to Google Sheets, using in-memory fallback:", googleError)
      // Add to in-memory storage as fallback
      inMemoryWeightEntries.push(entry)
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Error adding weight entry:", error)
    return NextResponse.json({ success: false, error: "Failed to add weight entry" }, { status: 500 })
  }
}
