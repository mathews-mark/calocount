import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { addTargetEntryToSheet, getLatestTargetsFromSheet, initializeSpreadsheet } from "@/lib/google-sheets"

// In-memory storage for targets as fallback
const inMemoryTargets = {
  calorieTarget: 2000,
  proteinTarget: 190,
}

export async function GET() {
  try {
    let targets

    // Try to get targets from Google Sheets
    try {
      // Make sure the spreadsheet is initialized
      await initializeSpreadsheet()

      targets = await getLatestTargetsFromSheet()
      console.log(`Retrieved targets from Google Sheets:`, targets)
    } catch (googleError) {
      console.error("Error fetching from Google Sheets, using in-memory fallback:", googleError)
      // Fallback to in-memory storage
      targets = inMemoryTargets
    }

    return NextResponse.json({ success: true, targets })
  } catch (error) {
    console.error("Error fetching targets:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch targets" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Received target data:", data)

    // Generate a unique ID if not provided
    const entry = {
      id: data.id || `target-${uuidv4()}`,
      date: data.date,
      calorieTarget: Number(data.calorieTarget),
      proteinTarget: Number(data.proteinTarget),
    }

    // Try to add to Google Sheets
    try {
      // Make sure the spreadsheet is initialized first
      await initializeSpreadsheet()

      await addTargetEntryToSheet(entry)
      console.log("Target entry added to Google Sheets successfully")

      // Update in-memory fallback
      inMemoryTargets.calorieTarget = entry.calorieTarget
      inMemoryTargets.proteinTarget = entry.proteinTarget
    } catch (googleError) {
      console.error("Error adding to Google Sheets, using in-memory fallback:", googleError)
      // Update in-memory fallback
      inMemoryTargets.calorieTarget = entry.calorieTarget
      inMemoryTargets.proteinTarget = entry.proteinTarget
    }

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Error adding target entry:", error)
    return NextResponse.json({ success: false, error: "Failed to add target entry" }, { status: 500 })
  }
}
