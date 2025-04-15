import { type NextRequest, NextResponse } from "next/server"
import { getStravaTokens, getStravaAthlete } from "@/lib/strava"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const debug = searchParams.get("debug") === "true"

    // Check if we have tokens
    const tokens = await getStravaTokens()

    // Prepare debug info
    const debugInfo = debug
      ? {
          tokensAvailable: !!tokens,
          clientIdConfigured: !!process.env.STRAVA_CLIENT_ID,
          clientSecretConfigured: !!process.env.STRAVA_CLIENT_SECRET,
          tokenExpiration: tokens ? new Date(tokens.expires_at * 1000).toISOString() : null,
          tokenExpired: tokens ? tokens.expires_at * 1000 < Date.now() : null,
          timeUntilExpiration: tokens
            ? Math.round((tokens.expires_at * 1000 - Date.now()) / 1000 / 60) + " minutes"
            : null,
        }
      : undefined

    if (!tokens) {
      return NextResponse.json({
        success: true,
        connected: false,
        athlete: null,
        debugInfo,
      })
    }

    // Try to get the athlete profile to verify the connection
    try {
      const athlete = await getStravaAthlete()

      return NextResponse.json({
        success: true,
        connected: !!athlete,
        athlete,
        tokenExpiresAt: tokens.expires_at,
        debugInfo,
      })
    } catch (athleteError) {
      console.error("Error fetching athlete:", athleteError)

      if (debug) {
        debugInfo.athleteError = athleteError instanceof Error ? athleteError.message : "Unknown error"
      }

      return NextResponse.json({
        success: false,
        connected: false,
        error: "Failed to fetch athlete profile",
        tokenExpiresAt: tokens.expires_at,
        debugInfo,
      })
    }
  } catch (error) {
    console.error("Error checking Strava status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        debugInfo: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
