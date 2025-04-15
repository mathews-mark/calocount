import { NextResponse, type NextRequest } from "next/server"
import type { CalorieEntry } from "@/types/calorie-entry"
import { updateEntryInSheet, deleteEntryFromSheet } from "@/lib/google-sheets"

// Update an entry
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updatedEntry: CalorieEntry = await request.json()

    // Update the entry in Google Sheets
    await updateEntryInSheet(updatedEntry)

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
    })
  } catch (error) {
    console.error("Error updating entry:", error)
    return NextResponse.json({ success: false, error: "Failed to update entry" }, { status: 500 })
  }
}

// Delete an entry
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Delete the entry from Google Sheets
    await deleteEntryFromSheet(id)

    return NextResponse.json({
      success: true,
      id,
    })
  } catch (error) {
    console.error("Error deleting entry:", error)
    return NextResponse.json({ success: false, error: "Failed to delete entry" }, { status: 500 })
  }
}
