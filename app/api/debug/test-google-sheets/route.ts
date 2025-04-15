import { NextResponse } from "next/server"
import { getGoogleSheetsClient, getSpreadsheetId, ENTRIES_SHEET_NAME } from "@/lib/google-sheets"
import { v4 as uuidv4 } from "uuid"
import { serviceAccountDetails } from "@/lib/gcp-credentials"

export async function POST() {
  const diagnostics = {
    success: false,
    environment: {
      hasProjectId: !!process.env.GCP_PROJECT_ID || !!serviceAccountDetails.projectId,
      hasClientEmail: !!process.env.GCP_CLIENT_EMAIL || !!serviceAccountDetails.clientEmail,
      hasPrivateKey: !!process.env.GCP_PRIVATE_KEY || !!serviceAccountDetails.privateKey,
      hasSpreadsheetId: !!process.env.GOOGLE_SPREADSHEET_ID,
      projectId: serviceAccountDetails.projectId || (process.env.GCP_PROJECT_ID ? "Present (hidden)" : "Not set"),
      clientEmail: serviceAccountDetails.clientEmail || (process.env.GCP_CLIENT_EMAIL ? "Present (hidden)" : "Not set"),
      privateKeyLength:
        serviceAccountDetails.privateKey?.length ||
        (process.env.GCP_PRIVATE_KEY ? process.env.GCP_PRIVATE_KEY.length : 0),
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "Not set",
      usingJsonCredentials: !!serviceAccountDetails.projectId,
    },
    client: {
      status: "Not initialized",
      error: null,
    },
    spreadsheet: {
      status: "Not found",
      id: null,
      error: null,
      sheets: [],
    },
    testEntry: {
      status: "Not attempted",
      error: null,
      data: null,
    },
  }

  try {
    // Check if we have the required credentials (either from JSON or environment variables)
    if (
      (!process.env.GCP_PROJECT_ID && !serviceAccountDetails.projectId) ||
      (!process.env.GCP_CLIENT_EMAIL && !serviceAccountDetails.clientEmail) ||
      (!process.env.GCP_PRIVATE_KEY && !serviceAccountDetails.privateKey)
    ) {
      diagnostics.client.status = "Failed - Missing credentials"
      return NextResponse.json(diagnostics)
    }

    // Try to initialize the Google Sheets client
    try {
      const { sheets } = await getGoogleSheetsClient()
      diagnostics.client.status = "Initialized successfully"

      // Try to get the spreadsheet ID
      try {
        const spreadsheetId = await getSpreadsheetId()
        diagnostics.spreadsheet.status = "Found"
        diagnostics.spreadsheet.id = spreadsheetId

        // Get information about the spreadsheet
        try {
          const spreadsheetInfo = await sheets.spreadsheets.get({
            spreadsheetId,
          })

          // List the sheets in the spreadsheet
          if (spreadsheetInfo.data.sheets) {
            diagnostics.spreadsheet.sheets = spreadsheetInfo.data.sheets.map((sheet) => ({
              title: sheet.properties?.title,
              sheetId: sheet.properties?.sheetId,
            }))
          }

          // Check if the Entries sheet exists
          const entriesSheetExists = spreadsheetInfo.data.sheets?.some(
            (sheet) => sheet.properties?.title === ENTRIES_SHEET_NAME,
          )

          if (!entriesSheetExists) {
            diagnostics.spreadsheet.status = "Missing Entries sheet"
          }

          // Try to add a test entry
          try {
            const testEntry = {
              id: uuidv4(),
              date: new Date().toISOString().split("T")[0],
              time: new Date().toTimeString().split(" ")[0].substring(0, 5),
              mealName: "Test Entry",
              calories: 100,
              protein: 10,
              carbs: 10,
              fat: 5,
              portion: 1,
              photoUrl: "",
              notes: "Debug test entry",
            }

            // Format the row data
            const rowData = [
              testEntry.id,
              testEntry.date,
              testEntry.time,
              testEntry.mealName,
              testEntry.calories.toString(),
              testEntry.protein.toString(),
              testEntry.carbs.toString(),
              testEntry.fat.toString(),
              testEntry.portion.toString(),
              testEntry.photoUrl,
              testEntry.notes,
            ]

            // Only try to add the entry if the Entries sheet exists
            if (entriesSheetExists) {
              // Append the row to the sheet
              const appendResult = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${ENTRIES_SHEET_NAME}!A:K`,
                valueInputOption: "RAW",
                insertDataOption: "INSERT_ROWS",
                requestBody: {
                  values: [rowData],
                },
              })

              diagnostics.testEntry.status = "Added successfully"
              diagnostics.testEntry.data = {
                entry: testEntry,
                appendResult: {
                  updatedRange: appendResult.data.updates?.updatedRange,
                  updatedRows: appendResult.data.updates?.updatedRows,
                },
              }
            } else {
              diagnostics.testEntry.status = "Skipped - Entries sheet does not exist"
              diagnostics.testEntry.data = {
                entry: testEntry,
              }
            }

            // Overall success
            diagnostics.success = true
          } catch (entryError) {
            diagnostics.testEntry.status = "Failed to add test entry"
            diagnostics.testEntry.error = entryError instanceof Error ? entryError.message : "Unknown error"
          }
        } catch (infoError) {
          diagnostics.spreadsheet.status = "Failed to get spreadsheet info"
          diagnostics.spreadsheet.error = infoError instanceof Error ? infoError.message : "Unknown error"
        }
      } catch (spreadsheetError) {
        diagnostics.spreadsheet.status = "Failed to find spreadsheet"
        diagnostics.spreadsheet.error = spreadsheetError instanceof Error ? spreadsheetError.message : "Unknown error"
      }
    } catch (clientError) {
      diagnostics.client.status = "Failed to initialize client"
      diagnostics.client.error = clientError instanceof Error ? clientError.message : "Unknown error"
    }
  } catch (error) {
    // Overall error
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    })
  }

  return NextResponse.json(diagnostics)
}
