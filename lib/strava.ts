import { serverOnly } from "./server-only"
import type { StravaActivity, StravaAthlete } from "@/types/strava"

// Mark this module as server-only
console.log(serverOnly)

// Strava API base URL
const STRAVA_API_BASE_URL = "https://www.strava.com/api/v3"

// Get Strava tokens from environment variables
export async function getStravaTokens() {
  try {
    console.log("Getting Strava tokens from environment variables")

    const access_token = process.env.STRAVA_ACCESS_TOKEN
    const refresh_token = process.env.STRAVA_REFRESH_TOKEN
    const expires_at = process.env.STRAVA_EXPIRES_AT ? Number.parseInt(process.env.STRAVA_EXPIRES_AT) : 0

    if (!access_token || !refresh_token) {
      console.log("No Strava tokens found in environment variables", {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        hasExpiresAt: !!process.env.STRAVA_EXPIRES_AT,
      })
      return null
    }

    console.log("Strava tokens found", {
      accessTokenPrefix: access_token.substring(0, 5) + "...",
      refreshTokenPrefix: refresh_token.substring(0, 5) + "...",
      expiresAt: new Date(expires_at * 1000).toISOString(),
    })

    return {
      access_token,
      refresh_token,
      expires_at,
    }
  } catch (error) {
    console.error("Error getting Strava tokens:", error)
    console.log("Error getting Strava tokens", error)
    return null
  }
}

// Save Strava tokens - this is a critical function that needs to actually update the tokens
export async function saveStravaTokens(tokens: {
  access_token: string
  refresh_token: string
  expires_at: number
}): Promise<boolean> {
  try {
    console.log("Saving Strava tokens:", {
      access_token_prefix: tokens.access_token.substring(0, 5) + "...",
      refresh_token_prefix: tokens.refresh_token.substring(0, 5) + "...",
      expires_at: new Date(tokens.expires_at * 1000).toISOString(),
    })

    // In a production app, you would store these in a database
    // For this demo, we'll log the values that need to be updated in your environment variables

    console.log("IMPORTANT: Update these environment variables in your Vercel project:")
    console.log(`STRAVA_ACCESS_TOKEN=${tokens.access_token}`)
    console.log(`STRAVA_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log(`STRAVA_EXPIRES_AT=${tokens.expires_at}`)

    // Return true to indicate success
    return true
  } catch (error) {
    console.error("Error saving Strava tokens:", error)
    return false
  }
}

// Refresh Strava access token if expired
export async function refreshStravaTokenIfNeeded(tokens: {
  access_token: string
  refresh_token: string
  expires_at: number
}) {
  try {
    // Check if token is expired or will expire in the next 10 minutes
    const now = Math.floor(Date.now() / 1000)

    console.log(`Token expires at: ${new Date(tokens.expires_at * 1000).toISOString()}`)
    console.log(`Current time: ${new Date(now * 1000).toISOString()}`)
    console.log(`Token is ${tokens.expires_at > now ? "valid" : "expired"}`)
    console.log(`Time until expiration: ${Math.round((tokens.expires_at - now) / 60)} minutes`)

    if (tokens.expires_at > now + 600) {
      // Token is still valid
      console.log("Token is still valid, no refresh needed")
      return tokens
    }

    console.log("Token expired or will expire soon, refreshing...")

    // Token is expired, refresh it
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      }),
    })

    console.log(`Refresh token response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`Refresh token error: ${errorText}`, {
        status: response.status,
        statusText: response.statusText,
      })

      // Log more detailed error information
      console.error(`Strava Token Refresh Error (${response.status}): ${errorText}`)

      throw new Error(`Failed to refresh token: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const newTokens = await response.json()
    console.log("Successfully refreshed token", {
      newExpiresAt: new Date(newTokens.expires_at * 1000).toISOString(),
    })

    // Save the new tokens
    await saveStravaTokens(newTokens)

    return newTokens
  } catch (error) {
    console.error("Error refreshing Strava token:", error)
    console.log("Error refreshing Strava token", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

// Get a valid Strava access token
export async function getValidStravaToken() {
  try {
    // Get the current tokens
    const tokens = await getStravaTokens()

    if (!tokens) {
      console.log("No tokens available")
      return null
    }

    // Refresh if needed
    const validTokens = await refreshStravaTokenIfNeeded(tokens)

    return validTokens.access_token
  } catch (error) {
    console.error("Error getting valid Strava token:", error)
    return null
  }
}

// Get Strava athlete profile
export async function getStravaAthlete(): Promise<StravaAthlete | null> {
  try {
    const accessToken = await getValidStravaToken()

    if (!accessToken) {
      return null
    }

    console.log("Fetching Strava athlete profile")
    const response = await fetch(`${STRAVA_API_BASE_URL}/athlete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // Log the response status for debugging
    console.log(`Athlete profile response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Athlete profile error: ${errorText}`)
      throw new Error(`Failed to get athlete: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const athlete = await response.json()
    console.log(`Retrieved athlete profile: ${athlete.firstname} ${athlete.lastname}`)
    return athlete
  } catch (error) {
    console.error("Error getting Strava athlete:", error)
    return null
  }
}

// Get recent Strava activities
export async function getStravaActivities(page = 1, perPage = 30) {
  try {
    console.log(`Fetching Strava activities: page=${page}, perPage=${perPage}`)

    const accessToken = await getValidStravaToken()

    if (!accessToken) {
      console.log("No valid access token available")
      return []
    }

    const url = `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`
    console.log(`Making request to: ${url}`)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    console.log(`Activities response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`Activities error: ${errorText}`, {
        status: response.status,
        statusText: response.statusText,
      })

      // Log more detailed error information
      console.error(`Strava API Error (${response.status}): ${errorText}`)

      throw new Error(`Failed to get activities: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const activities = await response.json()
    console.log(`Retrieved ${activities.length} activities from Strava API`)

    if (activities.length > 0) {
      console.log("Sample activity:", {
        id: activities[0].id,
        name: activities[0].name,
        type: activities[0].type,
        hasCalories: !!activities[0].calories,
      })
    }

    return activities
  } catch (error) {
    console.error("Error getting Strava activities:", error)
    console.log("Error getting Strava activities", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return []
  }
}

// Get a specific Strava activity
export async function getStravaActivity(activityId: number): Promise<StravaActivity | null> {
  try {
    const accessToken = await getValidStravaToken()

    if (!accessToken) {
      return null
    }

    const response = await fetch(`${STRAVA_API_BASE_URL}/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get activity: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting Strava activity:", error)
    return null
  }
}
