import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug } from "lucide-react"

export function StravaDebugLinks() {
  return (
    <Card className="mt-8 border-dashed border-gray-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bug className="h-4 w-4" /> Strava Debugging Tools
        </CardTitle>
        <CardDescription>Use these links to troubleshoot Strava integration issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Link
            href="/debug/strava-activity-debugger"
            className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Activity Debugger - See detailed API responses
          </Link>
          <Link
            href="/api/strava/token-debug"
            className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Token Status - Check your Strava tokens
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
