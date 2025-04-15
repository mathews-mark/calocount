import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredVars = ["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "NEXT_PUBLIC_STRAVA_CLIENT_ID"]

    const missing = requiredVars.filter((varName) => !process.env[varName])

    const clientIdMatch = process.env.STRAVA_CLIENT_ID === process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID

    return NextResponse.json({
      success: missing.length === 0 && clientIdMatch,
      missing,
      clientIdMatch,
      variables: {
        hasClientId: !!process.env.STRAVA_CLIENT_ID,
        hasClientSecret: !!process.env.STRAVA_CLIENT_SECRET,
        hasPublicClientId: !!process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      },
    })
  } catch (error) {
    console.error("Error checking Strava environment variables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
