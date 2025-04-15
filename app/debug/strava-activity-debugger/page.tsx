import { StravaActivityDebugger } from "@/components/strava-activity-debugger"
import { StravaConnect } from "@/components/strava-connect"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function StravaActivityDebuggerPage() {
  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Strava Activity Request Debugger</h1>
      <p className="text-muted-foreground">
        This tool shows you exactly what happens when requesting activities from Strava, including status codes, raw
        responses, and detailed error information.
      </p>

      <StravaActivityDebugger />

      <Card>
        <CardHeader>
          <CardTitle>Reconnect Strava</CardTitle>
          <CardDescription>If you're having issues, try reconnecting your Strava account</CardDescription>
        </CardHeader>
        <CardContent>
          <StravaConnect />
        </CardContent>
      </Card>
    </div>
  )
}
