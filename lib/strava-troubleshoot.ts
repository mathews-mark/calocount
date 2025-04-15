// Simple utility functions for Strava troubleshooting

/**
 * Check if all required Strava environment variables are set
 */
export function checkStravaEnvVars() {
  const requiredVars = [
    "STRAVA_CLIENT_ID",
    "STRAVA_CLIENT_SECRET",
    "NEXT_PUBLIC_STRAVA_CLIENT_ID",
    "STRAVA_ACCESS_TOKEN",
    "STRAVA_REFRESH_TOKEN",
    "STRAVA_EXPIRES_AT",
  ]

  const results = requiredVars.reduce(
    (acc, varName) => {
      acc[varName] = !!process.env[varName]
      return acc
    },
    {} as Record<string, boolean>,
  )

  const allPresent = Object.values(results).every(Boolean)

  return {
    results,
    allPresent,
  }
}

/**
 * Check if Strava tokens are valid and not expired
 */
export function checkStravaTokens() {
  const accessToken = process.env.STRAVA_ACCESS_TOKEN
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN
  const expiresAt = process.env.STRAVA_EXPIRES_AT

  if (!accessToken || !refreshToken || !expiresAt) {
    return {
      valid: false,
      expired: true,
      error: "Missing token information",
    }
  }

  const now = Math.floor(Date.now() / 1000)
  const expiration = Number.parseInt(expiresAt, 10)
  const isExpired = now >= expiration

  return {
    valid: true,
    expired: isExpired,
    expiresAt: new Date(expiration * 1000).toISOString(),
    timeRemaining: isExpired ? "Expired" : `${Math.floor((expiration - now) / 60)} minutes`,
  }
}

/**
 * Test Strava API connectivity
 */
export async function testStravaApi() {
  try {
    const accessToken = process.env.STRAVA_ACCESS_TOKEN

    if (!accessToken) {
      return {
        success: false,
        error: "No access token available",
      }
    }

    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        status: response.status,
        error: `API error: ${response.status} ${response.statusText}`,
        details: errorText,
      }
    }

    const data = await response.json()
    return {
      success: true,
      athlete: {
        id: data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        username: data.username,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Test Strava activities API
 */
export async function testStravaActivities() {
  try {
    const accessToken = process.env.STRAVA_ACCESS_TOKEN

    if (!accessToken) {
      return {
        success: false,
        error: "No access token available",
      }
    }

    const response = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=5", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        status: response.status,
        error: `API error: ${response.status} ${response.statusText}`,
        details: errorText,
      }
    }

    const activities = await response.json()
    return {
      success: true,
      count: activities.length,
      activities: activities.map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance,
        moving_time: activity.moving_time,
        calories: activity.calories,
      })),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Run all Strava diagnostics
 */
export async function runStravaDiagnostics() {
  const envCheck = checkStravaEnvVars()
  const tokenCheck = checkStravaTokens()

  let apiCheck = { success: false, error: "Not tested" }
  let activitiesCheck = { success: false, error: "Not tested" }

  // Only test API if tokens are present
  if (envCheck.allPresent && tokenCheck.valid) {
    apiCheck = await testStravaApi()
    activitiesCheck = await testStravaActivities()
  }

  return {
    environment: envCheck,
    tokens: tokenCheck,
    api: apiCheck,
    activities: activitiesCheck,
    timestamp: new Date().toISOString(),
  }
}
