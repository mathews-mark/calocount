import { GoogleSpreadsheet } from "google-spreadsheet"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { date, name, calories, protein, carbs, fat, portions } = await request.json()

    console.log("Updating food entry:", { id, date, name, calories, protein, carbs, fat, portions })

    // Initialize the Google Sheets API
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID!)
    await doc.useServiceAccountAuth({
      client_email: process.env.GCP_CLIENT_EMAIL!,
      private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    })

    await doc.loadInfo()

    // Get the Food sheet
    const sheet = doc.sheetsByTitle["Food"]
    if (!sheet) {
      console.error("Food sheet not found")
      return Response.json({ error: "Food sheet not found" }, { status: 404 })
    }

    // Load all rows
    const rows = await sheet.getRows()

    // Find the row with the matching ID
    const rowIndex = rows.findIndex((row) => row.rowIndex.toString() === id)
    if (rowIndex === -1) {
      console.error("Food entry not found")
      return Response.json({ error: "Food entry not found" }, { status: 404 })
    }

    // Update the row with numeric values stored as numbers
    rows[rowIndex].Date = date
    rows[rowIndex].Name = name
    rows[rowIndex].Calories = Math.round(Number(calories)) // Store as whole number
    rows[rowIndex].Protein = Math.round(Number(protein)) // Store as whole number
    rows[rowIndex].Carbs = Math.round(Number(carbs)) // Store as whole number
    rows[rowIndex].Fat = Math.round(Number(fat)) // Store as whole number
    rows[rowIndex].Portions = Number.parseFloat(portions) // Store as decimal

    // Save the changes
    await rows[rowIndex].save()

    console.log("Food entry updated successfully")

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error updating food entry:", error)
    return Response.json({ error: "Failed to update food entry" }, { status: 500 })
  }
}
