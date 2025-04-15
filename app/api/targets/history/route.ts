import { NextResponse } from "next/server"
import { getGoogleSheetsClient, getSpreadsheetId, TARGETS_SHEET_NAME } from "@/lib/google-sheets"

export async function GET() {
  try {
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    // Get all rows from the Targets sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${TARGETS_SHEET_NAME}!A:D`,
    })

    const rows = response.data.values || []

    // If there's only the header row or no rows, return empty array
    if (rows.length <= 1) {
      return NextResponse.json({ success: true, targets: [] })
    }

    // Skip the header row and map the remaining rows to the TargetEntry type
    const targets = rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      calorieTarget: Number(row[2]),
      proteinTarget: Number(row[3]),
    }))

    return NextResponse.json({ success: true, targets })
  } catch (error) {
    console.error("Error getting target history:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
