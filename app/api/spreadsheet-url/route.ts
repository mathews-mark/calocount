import { NextResponse } from "next/server"
import { getSpreadsheetId } from "@/lib/google-sheets"

export async function GET() {
  try {
    // Get the spreadsheet ID
    const spreadsheetId = await getSpreadsheetId()

    // Create the URL to the spreadsheet
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`

    return NextResponse.json({
      success: true,
      url,
    })
  } catch (error) {
    console.error("Error getting spreadsheet URL:", error)

    // Return a fallback URL
    return NextResponse.json(
      {
        success: false,
        error: "Could not retrieve the spreadsheet URL. Please check your Google Sheets configuration.",
      },
      { status: 500 },
    )
  }
}
