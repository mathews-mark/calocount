import { NextResponse } from "next/server"
import { getValidStravaToken } from "@/lib/strava"

export async function GET() {
  try {
    const accessToken = await getValidStravaToken()

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid Strava token available",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      accessToken: accessToken.substring(0, 5) + "..." + accessToken.substring(accessToken.length - 5),
    })
  } catch (error) {
    console.error("Error getting Strava token:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
