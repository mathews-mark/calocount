import { NextResponse } from "next/server"
import { getStravaAthlete } from "@/lib/strava"

export async function GET() {
  try {
    const athlete = await getStravaAthlete()

    if (!athlete) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch athlete data from Strava API",
      })
    }

    return NextResponse.json({
      success: true,
      athlete: {
        id: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
      },
    })
  } catch (error) {
    console.error("Error testing Strava API connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
