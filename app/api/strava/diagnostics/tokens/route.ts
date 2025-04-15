import { NextResponse } from "next/server"
import { getStravaTokens } from "@/lib/strava"

export async function GET() {
  try {
    const tokens = await getStravaTokens()

    if (!tokens) {
      return NextResponse.json({
        success: false,
        error: "No Strava tokens found",
      })
    }

    const now = Math.floor(Date.now() / 1000)
    const isExpired = tokens.expires_at < now
    const expiresAt = new Date(tokens.expires_at * 1000).toISOString()

    return NextResponse.json({
      success: !isExpired,
      expired: isExpired,
      expiresAt,
      tokenInfo: {
        accessTokenPrefix: tokens.access_token.substring(0, 5) + "...",
        refreshTokenPrefix: tokens.refresh_token.substring(0, 5) + "...",
      },
    })
  } catch (error) {
    console.error("Error checking Strava tokens:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
