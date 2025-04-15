import { NextResponse } from "next/server"
import { initializeSpreadsheet } from "@/lib/google-sheets"

export async function POST() {
  try {
    const result = await initializeSpreadsheet()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Spreadsheet initialized successfully",
        spreadsheetId: result.spreadsheetId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to initialize spreadsheet",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error initializing spreadsheet:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
