import { GoogleSpreadsheet } from "google-spreadsheet"

export async function POST(request: Request) {
  try {
    const { date, name, calories, protein, carbs, fat, portions } = await request.json()

    console.log("Adding food entry:", { date, name, calories, protein, carbs, fat, portions })

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

    // Add the new row with numeric values stored as numbers
    await sheet.addRow({
      Date: date,
      Name: name,
      Calories: Math.round(Number(calories)), // Store as whole number
      Protein: Math.round(Number(protein)), // Store as whole number
      Carbs: Math.round(Number(carbs)), // Store as whole number
      Fat: Math.round(Number(fat)), // Store as whole number
      Portions: Number.parseFloat(portions), // Store as decimal
    })

    console.log("Food entry added successfully")

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error adding food entry:", error)
    return Response.json({ error: "Failed to add food entry" }, { status: 500 })
  }
}
