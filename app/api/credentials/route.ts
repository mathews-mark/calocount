import { NextResponse } from "next/server"
import { serviceAccountDetails } from "@/lib/gcp-credentials"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      credentials: {
        projectId: serviceAccountDetails.projectId || process.env.GCP_PROJECT_ID || "Not set",
        clientEmail: serviceAccountDetails.clientEmail || process.env.GCP_CLIENT_EMAIL || "Not set",
        privateKeyLength: serviceAccountDetails.privateKey?.length || process.env.GCP_PRIVATE_KEY?.length || 0,
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "Not set",
        usingJsonCredentials: !!serviceAccountDetails.projectId,
      },
    })
  } catch (error) {
    console.error("Error getting credentials:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
