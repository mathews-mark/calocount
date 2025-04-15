import { NextResponse } from "next/server"
import { runStravaDiagnostics } from "@/lib/strava-troubleshoot"

export async function GET() {
  try {
    const diagnostics = await runStravaDiagnostics()
    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("Error running Strava diagnostics:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
