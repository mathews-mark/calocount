import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get environment variables
    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET
    const accessToken = process.env.STRAVA_ACCESS_TOKEN
    const refreshToken = process.env.STRAVA_REFRESH_TOKEN
    const expiresAt = process.env.STRAVA_EXPIRES_AT

    // Check if we have the necessary environment variables
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: "Missing Strava client credentials",
          envCheck: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasExpiresAt: !!expiresAt,
          },
        },
        { status: 400 },
      )
    }

    // Check if we have tokens
    if (!accessToken || !refreshToken || !expiresAt) {
      return NextResponse.json(
        {
          error: "Missing Strava tokens",
          envCheck: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasExpiresAt: !!expiresAt,
          },
        },
        { status: 400 },
      )
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    const tokenExpired = now >= Number.parseInt(expiresAt)

    // If token is expired, we need to refresh it
    let currentAccessToken = accessToken
    if (tokenExpired) {
      try {
        const response = await fetch("https://www.strava.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json(
            {
              error: "Failed to refresh token",
              details: errorText,
              status: response.status,
            },
            { status: 500 },
          )
        }

        const data = await response.json()
        currentAccessToken = data.access_token

        // Log the new tokens for the user to update their environment variables
        console.log(`STRAVA_ACCESS_TOKEN=${data.access_token}`)
        console.log(`STRAVA_REFRESH_TOKEN=${data.refresh_token}`)
        console.log(`STRAVA_EXPIRES_AT=${data.expires_at}`)
      } catch (error) {
        return NextResponse.json(
          {
            error: "Error refreshing token",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        )
      }
    }

    // Make a direct request to the Strava API
    try {
      const activitiesResponse = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=5", {
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
        },
      })

      if (!activitiesResponse.ok) {
        const errorText = await activitiesResponse.text()
        return NextResponse.json(
          {
            error: "Failed to fetch activities from Strava API",
            details: errorText,
            status: activitiesResponse.status,
          },
          { status: activitiesResponse.status },
        )
      }

      const activities = await activitiesResponse.json()

      return NextResponse.json({
        success: true,
        tokenStatus: {
          expired: tokenExpired,
          refreshed: tokenExpired,
        },
        activitiesCount: activities.length,
        activities: activities,
      })
    } catch (error) {
      return NextResponse.json(
        {
          error: "Error fetching activities from Strava API",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
