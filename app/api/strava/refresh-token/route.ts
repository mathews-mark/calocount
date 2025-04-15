import { NextResponse } from "next/server"
import { getStravaTokens, refreshStravaTokenIfNeeded } from "@/lib/strava"

export async function POST() {
  try {
    // Get current tokens
    const tokens = await getStravaTokens()

    if (!tokens) {
      return NextResponse.json(
        {
          success: false,
          error: "No Strava tokens found",
        },
        { status: 400 },
      )
    }

    // Force refresh the token
    const refreshedTokens = await refreshStravaTokenIfNeeded({
      ...tokens,
      // Set expires_at to now to force refresh
      expires_at: Math.floor(Date.now() / 1000) - 10,
    })

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      oldExpiresAt: new Date(tokens.expires_at * 1000).toISOString(),
      newExpiresAt: new Date(refreshedTokens.expires_at * 1000).toISOString(),
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
