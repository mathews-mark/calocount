import { StravaDiagnostics } from "@/components/strava-diagnostics"
import { StravaConnect } from "@/components/strava-connect"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function StravaDiagnosticsPage() {
  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Strava Diagnostics</h1>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          After authorizing with Strava, you must copy the new tokens from the console logs and update your environment
          variables.
        </AlertDescription>
      </Alert>

      <StravaDiagnostics />

      <Card>
        <CardHeader>
          <CardTitle>Reconnect Strava</CardTitle>
          <CardDescription>If you're having issues, try reconnecting your Strava account</CardDescription>
        </CardHeader>
        <CardContent>
          <StravaConnect />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">1. Missing or Expired Tokens</h3>
            <p className="text-muted-foreground">
              After connecting with Strava, you need to copy the tokens from the console logs and update your
              environment variables. Look for lines like:
            </p>
            <pre className="mt-1 p-2 bg-muted rounded text-xs">
              STRAVA_ACCESS_TOKEN=1234abcd...
              <br />
              STRAVA_REFRESH_TOKEN=5678efgh...
              <br />
              STRAVA_EXPIRES_AT=1234567890
            </pre>
          </div>

          <div>
            <h3 className="font-medium">2. Incorrect Redirect URI</h3>
            <p className="text-muted-foreground">
              Make sure your Strava app settings have the correct redirect URI. It should be:
            </p>
            <pre className="mt-1 p-2 bg-muted rounded text-xs">
              {typeof window !== "undefined"
                ? `${window.location.origin}/api/strava/callback`
                : "[your-domain]/api/strava/callback"}
            </pre>
          </div>

          <div>
            <h3 className="font-medium">3. No Activities in Strava</h3>
            <p className="text-muted-foreground">
              Check if you have activities in your Strava account. If you've just created a Strava account, you might
              not have any activities yet.
            </p>
          </div>

          <div>
            <h3 className="font-medium">4. Permission Issues</h3>
            <p className="text-muted-foreground">
              Make sure you've granted the app permission to access your activities. You might need to revoke access in
              your Strava settings and reconnect with the correct permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
