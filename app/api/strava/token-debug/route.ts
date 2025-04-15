import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the raw token values from environment variables
    const access_token = process.env.STRAVA_ACCESS_TOKEN
    const refresh_token = process.env.STRAVA_REFRESH_TOKEN
    const expires_at = process.env.STRAVA_EXPIRES_AT
    const client_id = process.env.STRAVA_CLIENT_ID
    const client_secret = process.env.STRAVA_CLIENT_SECRET
    const public_client_id = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID

    // Calculate if token is expired
    const now = Math.floor(Date.now() / 1000)
    const expiresAtNum = expires_at ? Number.parseInt(expires_at, 10) : 0
    const isExpired = expiresAtNum <= now

    return NextResponse.json({
      success: true,
      tokenStatus: {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        hasExpiresAt: !!expires_at,
        hasClientId: !!client_id,
        hasClientSecret: !!client_secret,
        hasPublicClientId: !!public_client_id,
        accessTokenPrefix: access_token ? access_token.substring(0, 5) + "..." : null,
        refreshTokenPrefix: refresh_token ? refresh_token.substring(0, 5) + "..." : null,
        expiresAt: expiresAtNum ? new Date(expiresAtNum * 1000).toISOString() : null,
        isExpired,
        timeUntilExpiration: expiresAtNum ? Math.round((expiresAtNum - now) / 60) + " minutes" : null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get token information",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
