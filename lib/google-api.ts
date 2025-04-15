import { google } from "googleapis"

// Get the spreadsheet ID from environment variables
export async function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set")
  }
  return spreadsheetId
}

// Get the Google Sheets client
export async function getGoogleSheetsClient() {
  try {
    // Load the service account credentials from environment variables
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        project_id: process.env.GCP_PROJECT_ID,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const client = await auth.getClient()
    const sheets = google.sheets({ version: "v4", auth: client })

    return { auth, sheets }
  } catch (error) {
    console.error("Error getting Google Sheets client:", error)
    throw error
  }
}
