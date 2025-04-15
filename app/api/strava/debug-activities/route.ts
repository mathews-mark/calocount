import { NextResponse } from "next/server"
import { getStravaTokens, refreshStravaTokenIfNeeded } from "@/lib/strava"

export async function GET() {
  try {
    // Get detailed information about the tokens
    const tokens = await getStravaTokens()

    if (!tokens) {
      return NextResponse.json(
        {
          success: false,
          error: "No Strava tokens found",
          tokenStatus: {
            hasAccessToken: false,
            hasRefreshToken: false,
            hasExpiresAt: false,
          },
        },
        { status: 401 },
      )
    }

    // Check token expiration
    const now = Math.floor(Date.now() / 1000)
    const isExpired = tokens.expires_at <= now

    // Include token information in the response
    const tokenInfo = {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      accessTokenPrefix: tokens.access_token ? tokens.access_token.substring(0, 5) + "..." : null,
      refreshTokenPrefix: tokens.refresh_token ? tokens.refresh_token.substring(0, 5) + "..." : null,
      expiresAt: tokens.expires_at ? new Date(tokens.expires_at * 1000).toISOString() : null,
      isExpired,
      timeUntilExpiration: tokens.expires_at ? Math.round((tokens.expires_at - now) / 60) + " minutes" : null,
    }

    // Try to refresh the token if needed
    let validTokens
    try {
      validTokens = await refreshStravaTokenIfNeeded(tokens)
    } catch (refreshError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to refresh token",
          tokenInfo,
          refreshError: refreshError instanceof Error ? refreshError.message : String(refreshError),
        },
        { status: 401 },
      )
    }

    // Make the actual request to Strava API
    try {
      const url = "https://www.strava.com/api/v3/athlete/activities?page=1&per_page=10"
      console.log(`Making request to: ${url}`)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${validTokens.access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      // Get the raw response text
      const rawText = await response.text()

      // Try to parse as JSON if possible
      let parsedData = null
      try {
        parsedData = JSON.parse(rawText)
      } catch (e) {
        // If it's not valid JSON, we'll just use the raw text
      }

      return NextResponse.json({
        success: response.ok,
        statusCode: response.status,
        statusText: response.statusText,
        tokenInfo,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: rawText,
        parsedData,
        activitiesCount: Array.isArray(parsedData) ? parsedData.length : 0,
      })
    } catch (apiError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch activities from Strava API",
          tokenInfo,
          apiError: apiError instanceof Error ? apiError.message : String(apiError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error in debug endpoint",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
