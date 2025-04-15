import { NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID!)

    // Authenticate with Google Sheets API
    try {
      await doc.useServiceAccountAuth({
        client_email: process.env.GCP_CLIENT_EMAIL!,
        private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      })
    } catch (authError) {
      console.error("Error authenticating with Google Sheets API:", authError)
      return NextResponse.json(
        {
          success: false,
          error: `Authentication Error: ${authError instanceof Error ? authError.message : "Unknown authentication error"}`,
        },
        { status: 500 },
      )
    }

    await doc.loadInfo()

    const sheets = Object.keys(doc.sheetsByTitle)

    return NextResponse.json({
      success: true,
      sheets,
      spreadsheetTitle: doc.title,
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    })
  } catch (error) {
    console.error("Error fetching sheets:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
