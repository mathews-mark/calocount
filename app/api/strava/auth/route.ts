import { NextResponse, type NextRequest } from "next/server"
import { exchangeStravaCode } from "@/lib/strava-auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    // If there's an error or no code, return an error
    if (error || !code) {
      console.error(`Strava auth error: ${error || "No authorization code provided"}`)
      return NextResponse.redirect(
        new URL(
          `/strava?auth=error&message=${encodeURIComponent(error || "No authorization code provided")}`,
          request.url,
        ),
      )
    }

    console.log("Received authorization code:", code)
    console.log("Request URL:", request.url)

    // Exchange the code for tokens
    const result = await exchangeStravaCode(code)

    if (!result.success) {
      console.error("Token exchange error:", result.error)
      return NextResponse.redirect(
        new URL(
          `/strava?auth=error&message=${encodeURIComponent(result.error || "Failed to exchange code for token")}`,
          request.url,
        ),
      )
    }

    // Redirect to the Strava page with a success parameter
    return NextResponse.redirect(new URL("/strava?auth=success", request.url))
  } catch (error) {
    console.error("Error in Strava auth callback:", error)
    // Redirect to the Strava page with an error parameter
    return NextResponse.redirect(
      new URL(
        `/strava?auth=error&message=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`,
        request.url,
      ),
    )
  }
}
