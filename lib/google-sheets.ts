import { google } from "googleapis"
import { serviceAccountDetails } from "./gcp-credentials"

// Mark this module as server-only
import { serverOnly } from "./server-only"
console.log(serverOnly)

// Spreadsheet constants
export const ENTRIES_SHEET_NAME = "Entries"
export const WEIGHT_SHEET_NAME = "Weight"
export const TARGETS_SHEET_NAME = "Targets"
export const TARGETS_SHEET_HEADERS = ["ID", "Date", "CalorieTarget", "ProteinTarget"]

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
    // Use service account JSON if available, otherwise use environment variables
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountDetails.projectId
        ? {
            client_email: serviceAccountDetails.clientEmail,
            private_key: serviceAccountDetails.privateKey,
            project_id: serviceAccountDetails.projectId,
          }
        : {
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

// Initialize the spreadsheet
export async function initializeSpreadsheet() {
  try {
    const spreadsheetId = await getSpreadsheetId()
    const { sheets } = await getGoogleSheetsClient()

    // Check if the spreadsheet exists
    try {
      await sheets.spreadsheets.get({ spreadsheetId })
    } catch (error: any) {
      if (error.code === 404) {
        return { success: false, error: "Spreadsheet not found. Please check your GOOGLE_SPREADSHEET_ID." }
      }
      throw error // Re-throw other errors
    }

    // Check if the Entries sheet exists
    const entriesSheetExists = await sheetExists(sheets, spreadsheetId, ENTRIES_SHEET_NAME)

    // Create the Entries sheet if it doesn't exist
    if (!entriesSheetExists) {
      await createEntriesSheet(sheets, spreadsheetId)
    }

    // Check if the Weight sheet exists
    const weightSheetExists = await sheetExists(sheets, spreadsheetId, WEIGHT_SHEET_NAME)

    // Create the Weight sheet if it doesn't exist
    if (!weightSheetExists) {
      await createWeightSheet(sheets, spreadsheetId)
    }

    // Check if the Targets sheet exists
    const targetsSheetExists = await sheetExists(sheets, spreadsheetId, TARGETS_SHEET_NAME)

    // Create the Targets sheet if it doesn't exist
    if (!targetsSheetExists) {
      await ensureTargetsSheetExists(spreadsheetId, sheets)
    }

    return { success: true, spreadsheetId }
  } catch (error: any) {
    console.error("Error initializing spreadsheet:", error)
    return { success: false, error: error.message }
  }
}

// Helper function to check if a sheet exists
async function sheetExists(sheets: any, spreadsheetId: string, sheetName: string) {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const sheetsData = response.data.sheets
    if (!sheetsData) return false

    return sheetsData.some((sheet: any) => sheet.properties?.title === sheetName)
  } catch (error) {
    console.error(`Error checking if sheet "${sheetName}" exists:`, error)
    return false // Assume sheet doesn't exist in case of error
  }
}

// Helper function to create the Entries sheet
async function createEntriesSheet(sheets: any, spreadsheetId: string) {
  try {
    // Add the Entries sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: ENTRIES_SHEET_NAME,
              },
            },
          },
        ],
      },
    })

    // Add headers to the Entries sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A1:K1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["ID", "Date", "Time", "Meal Name", "Calories", "Protein", "Carbs", "Fat", "Portion", "Photo URL", "Notes"],
        ],
      },
    })
  } catch (error) {
    console.error("Error creating Entries sheet:", error)
    throw error
  }
}

// Helper function to create the Weight sheet
async function createWeightSheet(sheets: any, spreadsheetId: string) {
  try {
    // Add the Weight sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: WEIGHT_SHEET_NAME,
              },
            },
          },
        ],
      },
    })

    // Add headers to the Weight sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${WEIGHT_SHEET_NAME}!A1:E1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Date", "Time", "Weight", "Notes"]],
      },
    })
  } catch (error) {
    console.error("Error creating Weight sheet:", error)
    throw error
  }
}

// Add a new entry to the sheet
export async function addEntryToSheet(entry: any) {
  try {
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    // Format the row data
    const rowData = [
      entry.id,
      entry.date,
      entry.time,
      entry.mealName,
      entry.calories.toString(),
      entry.protein.toString(),
      entry.carbs.toString(),
      entry.fat.toString(),
      entry.portion.toString(),
      entry.photoUrl,
      entry.notes,
    ]

    // Append the row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A:K`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowData],
      },
    })
  } catch (error) {
    console.error("Error adding entry to sheet:", error)
    throw error
  }
}

// Update an existing entry in the sheet
export async function updateEntryInSheet(entry: any) {
  try {
    console.log("Starting updateEntryInSheet with entry:", entry)
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    // Get all entries to find the row index of the entry to update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A:A`, // Only get the ID column to find the row
    })

    const rows = response.data.values || []

    // Find the row index with the matching ID (add 1 for header row)
    let rowIndex = -1
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === entry.id) {
        rowIndex = i + 1 // +1 because sheets are 1-indexed
        break
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Entry with ID ${entry.id} not found in sheet`)
    }

    console.log(`Found entry at row ${rowIndex}`)

    // Format the row data
    const rowData = [
      entry.id,
      entry.date,
      entry.time,
      entry.mealName,
      entry.calories.toString(),
      entry.protein.toString(),
      entry.carbs.toString(),
      entry.fat.toString(),
      entry.portion.toString(),
      entry.photoUrl || "",
      entry.notes || "",
    ]

    // Update the row in the sheet
    const updateResult = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A${rowIndex}:K${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    })

    console.log("Update result:", updateResult.data)
    return { success: true }
  } catch (error) {
    console.error("Error updating entry in sheet:", error)
    throw error
  }
}

// Delete an entry from the sheet
export async function deleteEntryFromSheet(entryId: string) {
  try {
    console.log("Starting deleteEntryFromSheet with ID:", entryId)
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    // Get all entries to find the row index of the entry to delete
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A:A`, // Only get the ID column to find the row
    })

    const rows = response.data.values || []

    // Find the row index with the matching ID
    let rowIndex = -1
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === entryId) {
        rowIndex = i + 1 // +1 because sheets are 1-indexed
        break
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Entry with ID ${entryId} not found in sheet`)
    }

    console.log(`Found entry at row ${rowIndex}`)

    // Clear the row in the sheet
    const clearResult = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A${rowIndex}:K${rowIndex}`,
    })

    console.log("Clear result:", clearResult.data)
    return { success: true }
  } catch (error) {
    console.error("Error deleting entry from sheet:", error)
    throw error
  }
}

// Get all entries from the sheet
export async function getAllEntries() {
  try {
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ENTRIES_SHEET_NAME}!A:K`,
    })

    const rows = response.data.values || []

    // Skip the header row and map the remaining rows to the CalorieEntry type
    return rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      time: row[2],
      mealName: row[3],
      calories: Number(row[4]),
      protein: Number(row[5]),
      carbs: Number(row[6]),
      fat: Number(row[7]),
      portion: Number(row[8]),
      photoUrl: row[9],
      notes: row[10],
    }))
  } catch (error) {
    console.error("Error getting all entries from sheet:", error)
    throw error
  }
}

// Get entries for a specific date range from the sheet
export async function getEntriesForDateRange(startDate: string, endDate: string) {
  try {
    const allEntries = await getAllEntries()

    // Filter entries by date range
    return allEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const start = new Date(startDate)
      const end = new Date(endDate)

      // Set time to midnight for accurate date comparison
      entryDate.setHours(0, 0, 0, 0)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)

      return entryDate >= start && entryDate <= end
    })
  } catch (error) {
    console.error("Error getting entries for date range from sheet:", error)
    throw error
  }
}

// Add a new weight entry to the sheet
export async function addWeightEntryToSheet(entry: any) {
  try {
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    // Format the row data
    const rowData = [entry.id, entry.date, entry.time, entry.weight.toString(), entry.notes]

    // Append the row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${WEIGHT_SHEET_NAME}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowData],
      },
    })
  } catch (error) {
    console.error("Error adding weight entry to sheet:", error)
    throw error
  }
}

// Get all weight entries from the sheet
export async function getAllWeightEntries() {
  try {
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${WEIGHT_SHEET_NAME}!A:E`,
    })

    const rows = response.data.values || []

    // Skip the header row and map the remaining rows to the WeightEntry type
    return rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      time: row[2],
      weight: Number(row[3]),
      notes: row[4],
    }))
  } catch (error) {
    console.error("Error getting all weight entries from sheet:", error)
    throw error
  }
}

// Add this function to ensure the Targets sheet exists
async function ensureTargetsSheetExists(spreadsheetId: string, sheets: any) {
  try {
    // Get existing sheets
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    // Check if Targets sheet exists
    const targetsSheetExists = sheetsResponse.data.sheets?.some(
      (sheet: any) => sheet.properties?.title === TARGETS_SHEET_NAME,
    )

    if (!targetsSheetExists) {
      console.log("Creating 'Targets' sheet")
      // Add the Targets sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: TARGETS_SHEET_NAME,
                  index: 2, // Make it the third sheet
                },
              },
            },
          ],
        },
      })

      // Add headers to the Targets sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${TARGETS_SHEET_NAME}!A1:D1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [TARGETS_SHEET_HEADERS],
        },
      })
    }

    return true
  } catch (error) {
    console.error("Error ensuring Targets sheet exists:", error)
    throw error
  }
}

// Add this function to add a target entry to the sheet
export async function addTargetEntryToSheet(entry: {
  id: string
  date: string
  calorieTarget: number
  proteinTarget: number
}) {
  try {
    console.log("Starting addTargetEntryToSheet with entry:", entry)
    const { sheets } = await getGoogleSheetsClient()
    console.log("Got Google Sheets client")

    const spreadsheetId = await getSpreadsheetId()
    console.log("Using spreadsheet with ID:", spreadsheetId)

    // Make sure the Targets sheet exists
    await ensureTargetsSheetExists(spreadsheetId, sheets)

    // Format the row data
    const rowData = [entry.id, entry.date, entry.calorieTarget.toString(), entry.proteinTarget.toString()]

    console.log("Formatted row data:", rowData)

    // Append the row to the sheet
    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${TARGETS_SHEET_NAME}!A:D`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowData],
      },
    })

    console.log("Append result:", appendResult.data)
    return { success: true }
  } catch (error) {
    console.error("Error adding target entry to sheet:", error)
    throw error
  }
}

// Add this function to get the latest targets from the sheet
export async function getLatestTargetsFromSheet() {
  try {
    const { sheets } = await getGoogleSheetsClient()
    const spreadsheetId = await getSpreadsheetId()

    // Make sure the Targets sheet exists
    await ensureTargetsSheetExists(spreadsheetId, sheets)

    // Get all rows from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${TARGETS_SHEET_NAME}!A:D`,
    })

    const rows = response.data.values || []

    // If there's only the header row or no rows, return default values
    if (rows.length <= 1) {
      return {
        calorieTarget: 2700, // Default calorie target
        proteinTarget: 190, // Default protein target
      }
    }

    // Get the latest entry (last row)
    const latestRow = rows[rows.length - 1]

    return {
      calorieTarget: Number(latestRow[2]) || 2700,
      proteinTarget: Number(latestRow[3]) || 190,
    }
  } catch (error) {
    console.error("Error getting latest targets from sheet:", error)
    // Return default values if there's an error
    return {
      calorieTarget: 2700,
      proteinTarget: 190,
    }
  }
}
