import { NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"

export async function GET() {
  try {
    // Initialize with server-side environment variables (not NEXT_PUBLIC_*)
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID!)

    try {
      await doc.useServiceAccountAuth({
        client_email: process.env.GCP_CLIENT_EMAIL!,
        private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        project_id: process.env.GCP_PROJECT_ID!,
      })
    } catch (authError) {
      console.error("Error during service account authentication:", authError)
      return NextResponse.json(
        {
          success: false,
          error: `Authentication error: ${authError instanceof Error ? authError.message : "Unknown authentication error"}`,
        },
        { status: 401 }, // Or another appropriate status code
      )
    }

    await doc.loadInfo()

    const sheetsList = Object.keys(doc.sheetsByTitle)

    let settingsData = null
    if (doc.sheetsByTitle["Settings"]) {
      const sheet = doc.sheetsByTitle["Settings"]
      await sheet.loadCells("A1:B10")

      const calorieTargetCell = sheet.getCellByA1("B1")
      const proteinTargetCell = sheet.getCellByA1("B2")

      settingsData = {
        calorieTarget: calorieTargetCell?.value,
        proteinTarget: proteinTargetCell?.value,
        calorieTargetType: typeof calorieTargetCell?.value,
        proteinTargetType: typeof proteinTargetCell?.value,
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        spreadsheetTitle: doc.title,
        sheets: sheetsList,
        settingsData,
      },
    })
  } catch (error) {
    console.error("Error fetching direct sheets data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
