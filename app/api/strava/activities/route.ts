import { NextResponse } from "next/server"
import { getStravaActivities } from "@/lib/strava"

export async function GET() {
  try {
    const activities = await getStravaActivities(1, 10) // Get first 10 activities

    return NextResponse.json({
      success: true,
      activities,
    })
  } catch (error) {
    console.error("Error fetching Strava activities:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
