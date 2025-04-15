import { NextResponse } from "next/server"
import { getStravaTokens } from "@/lib/strava"

export async function GET() {
  try {
    // Check environment variables
    const diagnostics = {
      env: {
        hasClientId: !!process.env.STRAVA_CLIENT_ID,
        hasPublicClientId: !!process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        hasClientSecret: !!process.env.STRAVA_CLIENT_SECRET,
        hasAccessToken: !!process.env.STRAVA_ACCESS_TOKEN,
        hasRefreshToken: !!process.env.STRAVA_REFRESH_TOKEN,
        hasExpiresAt: !!process.env.STRAVA_EXPIRES_AT,
        clientIdMatch: process.env.STRAVA_CLIENT_ID === process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      },
      tokens: null as any,
    }

    // Check tokens
    const tokens = await getStravaTokens()
    if (tokens) {
      const now = Math.floor(Date.now() / 1000)
      diagnostics.tokens = {
        accessToken: !!tokens.access_token,
        refreshToken: !!tokens.refresh_token,
        expiresAt: tokens.expires_at,
        isExpired: tokens.expires_at < now,
        timeRemaining: tokens.expires_at - now,
      }
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("Error running Strava diagnostics:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
