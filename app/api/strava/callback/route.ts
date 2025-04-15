import { NextResponse, type NextRequest } from "next/server"
import { saveStravaTokens } from "@/lib/strava"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    // If there's an error or no code, return an error
    if (error || !code) {
      return NextResponse.json(
        {
          success: false,
          error: error || "No authorization code provided",
        },
        { status: 400 },
      )
    }

    // Exchange the code for tokens
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
      return NextResponse.json(
        {
          success: false,
          error: `Failed to exchange code for token: ${errorText}`,
        },
        { status: 500 },
      )
    }

    const tokens = await response.json()

    // Save the tokens
    await saveStravaTokens(tokens)

    // Redirect to the Strava page
    return NextResponse.redirect(new URL("/strava", request.url))
  } catch (error) {
    console.error("Error in Strava auth callback:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
