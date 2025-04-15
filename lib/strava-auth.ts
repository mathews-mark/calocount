import { serverOnly } from "./server-only"
import { saveStravaTokens, getStravaTokens } from "./strava"

// Mark this module as server-only
console.log(serverOnly)

// Validate Strava credentials
export async function validateStravaCredentials() {
  try {
    // Check if required environment variables are set
    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET
    const publicClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID

    const issues = []

    if (!clientId) {
      issues.push("STRAVA_CLIENT_ID is missing")
    }

    if (!clientSecret) {
      issues.push("STRAVA_CLIENT_SECRET is missing")
    }

    if (!publicClientId) {
      issues.push("NEXT_PUBLIC_STRAVA_CLIENT_ID is missing")
    }

    if (clientId && publicClientId && clientId !== publicClientId) {
      issues.push("STRAVA_CLIENT_ID and NEXT_PUBLIC_STRAVA_CLIENT_ID do not match")
    }

    // Check if tokens exist
    const tokens = await getStravaTokens()
    if (!tokens) {
      issues.push("No Strava tokens found")
    } else {
      // Check token expiration
      const now = Math.floor(Date.now() / 1000)
      if (tokens.expires_at < now) {
        issues.push(`Access token is expired (expired at ${new Date(tokens.expires_at * 1000).toISOString()})`)
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      credentials: {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasPublicClientId: !!publicClientId,
        hasTokens: !!tokens,
      },
    }
  } catch (error) {
    console.error("Error validating Strava credentials:", error)
    return {
      isValid: false,
      issues: [error instanceof Error ? error.message : "Unknown error validating credentials"],
      credentials: {
        hasClientId: false,
        hasClientSecret: false,
        hasPublicClientId: false,
        hasTokens: false,
      },
    }
  }
}

// Generate Strava authorization URL
export function generateStravaAuthUrl(redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID

  if (!clientId) {
    throw new Error("Strava client ID not found in environment variables")
  }

  return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=activity:read,activity:read_all`
}

// Exchange authorization code for tokens
export async function exchangeStravaCode(code: string) {
  try {
    console.log("Exchanging authorization code for tokens")

    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Token exchange error (${response.status}): ${errorText}`)
      throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const tokens = await response.json()
    console.log("Successfully exchanged code for tokens")

    // Save the tokens
    await saveStravaTokens(tokens)

    return {
      success: true,
      tokens,
    }
  } catch (error) {
    console.error("Error exchanging Strava code:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Revoke Strava tokens
export async function revokeStravaTokens() {
  try {
    const tokens = await getStravaTokens()

    if (!tokens) {
      return {
        success: false,
        error: "No tokens to revoke",
      }
    }

    const response = await fetch("https://www.strava.com/oauth/deauthorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: tokens.access_token,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to revoke token: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error revoking Strava tokens:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
