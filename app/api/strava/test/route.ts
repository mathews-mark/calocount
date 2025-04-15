import { NextResponse } from "next/server"
import { getStravaTokens, refreshStravaTokenIfNeeded, getStravaActivities, getStravaAthlete } from "@/lib/strava"

export async function GET() {
  try {
    const results = {
      success: false,
      tokens: {
        available: false,
        valid: false,
        expired: false,
        refreshable: false,
        details: null as any,
      },
      athlete: {
        success: false,
        data: null as any,
        error: null as any,
      },
      activities: {
        success: false,
        count: 0,
        sample: null as any,
        error: null as any,
      },
      details: null as any,
    }

    // Step 1: Check if tokens exist
    const tokens = await getStravaTokens()
    if (!tokens) {
      return NextResponse.json({
        ...results,
        details: "No Strava tokens found. Please connect your Strava account.",
      })
    }

    results.tokens.available = true

    // Add token details (with sensitive parts redacted)
    const now = Math.floor(Date.now() / 1000)
    results.tokens.details = {
      access_token: tokens.access_token ? `${tokens.access_token.substring(0, 5)}...` : null,
      refresh_token: tokens.refresh_token ? `${tokens.refresh_token.substring(0, 5)}...` : null,
      expires_at: tokens.expires_at,
      expires_at_formatted: tokens.expires_at ? new Date(tokens.expires_at * 1000).toISOString() : null,
      is_expired: tokens.expires_at < now,
      time_until_expiry: tokens.expires_at - now,
    }

    results.tokens.expired = tokens.expires_at < now

    // Step 2: Try to refresh the token if expired
    try {
      if (results.tokens.expired) {
        const refreshedTokens = await refreshStravaTokenIfNeeded(tokens)
        results.tokens.refreshable = true
        results.tokens.details.refreshed = true
        results.tokens.details.new_expires_at = refreshedTokens.expires_at
        results.tokens.details.new_expires_at_formatted = new Date(refreshedTokens.expires_at * 1000).toISOString()
      } else {
        results.tokens.valid = true
      }
    } catch (refreshError) {
      results.tokens.refreshable = false
      results.tokens.details.refresh_error = refreshError instanceof Error ? refreshError.message : String(refreshError)
    }

    // Step 3: Try to get athlete profile
    try {
      const athlete = await getStravaAthlete()
      results.athlete.success = !!athlete
      results.athlete.data = athlete
        ? {
            id: athlete.id,
            name: `${athlete.firstname} ${athlete.lastname}`,
            username: athlete.username,
            profile: athlete.profile ? true : false,
          }
        : null
    } catch (athleteError) {
      results.athlete.error = athleteError instanceof Error ? athleteError.message : String(athleteError)
    }

    // Step 4: Try to get activities
    try {
      const activities = await getStravaActivities(1, 5)
      results.activities.success = true
      results.activities.count = activities.length

      if (activities.length > 0) {
        // Just include basic info for the first activity as a sample
        results.activities.sample = {
          id: activities[0].id,
          name: activities[0].name,
          type: activities[0].type,
          start_date: activities[0].start_date,
          has_calories: !!activities[0].calories,
        }
      }
    } catch (activitiesError) {
      results.activities.error = activitiesError instanceof Error ? activitiesError.message : String(activitiesError)
    }

    // Overall success if we could get either athlete or activities
    results.success = results.athlete.success || results.activities.success

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error testing Strava API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
