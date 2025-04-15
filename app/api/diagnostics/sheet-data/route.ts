import { type NextRequest, NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sheetName = searchParams.get("sheet")

  if (!sheetName) {
    return NextResponse.json(
      {
        success: false,
        error: "Sheet name is required",
      },
      { status: 400 },
    )
  }

  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID!)

    // Authentication must be done outside of conditional blocks
    try {
      await doc.useServiceAccountAuth({
        client_email: process.env.GCP_CLIENT_EMAIL!,
        private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      })
    } catch (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
        },
        { status: 500 },
      )
    }

    await doc.loadInfo()

    if (!doc.sheetsByTitle[sheetName]) {
      return NextResponse.json(
        {
          success: false,
          error: `Sheet "${sheetName}" not found`,
        },
        { status: 404 },
      )
    }

    const sheet = doc.sheetsByTitle[sheetName]
    await sheet.loadCells("A1:Z10") // Load a reasonable range of cells

    const cells: Record<string, any> = {}

    // Extract cell values for the first 10 rows and 26 columns (A-Z)
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 26; col++) {
        const cell = sheet.getCell(row, col)
        if (cell.value !== null && cell.value !== undefined) {
          const cellId = `${String.fromCharCode(65 + col)}${row + 1}`
          cells[cellId] = {
            value: cell.value,
            type: typeof cell.value,
            formula: cell.formula || null,
            formattedValue: cell.formattedValue || null,
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sheetTitle: sheet.title,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      cells,
    })
  } catch (error) {
    console.error(`Error fetching data for sheet "${sheetName}":`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
