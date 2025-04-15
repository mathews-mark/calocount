import { getStravaTokens, getStravaAthlete } from "@/lib/strava"
import { validateStravaCredentials } from "@/lib/strava-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle } from "lucide-react"
import { StravaTroubleshooter } from "@/components/strava-troubleshooter"
import { StravaConnect } from "@/components/strava-connect"

export default async function StravaDebugPage() {
  const tokens = await getStravaTokens()
  const athlete = await getStravaAthlete()
  const validation = await validateStravaCredentials()

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Strava Debug & Troubleshooting</h1>

      {!validation.isValid && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Strava Integration Issues Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            <ul className="list-disc pl-5 mt-2">
              {validation.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.isValid && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Strava Integration is Working</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Strava integration is properly configured and connected.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Connection Status</TabsTrigger>
          <TabsTrigger value="troubleshoot">Troubleshooter</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strava Connection Status</CardTitle>
              <CardDescription>Current status of your Strava integration</CardDescription>
            </CardHeader>
            <CardContent>
              {tokens ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 text-green-800 rounded-md">
                    <p className="font-medium">✅ Connected to Strava</p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Token Information:</p>
                    <ul className="list-disc pl-5">
                      <li>
                        Access Token: {tokens.access_token.substring(0, 5)}...
                        {tokens.access_token.substring(tokens.access_token.length - 5)}
                      </li>
                      <li>
                        Refresh Token: {tokens.refresh_token.substring(0, 5)}...
                        {tokens.refresh_token.substring(tokens.refresh_token.length - 5)}
                      </li>
                      <li>Expires At: {new Date(tokens.expires_at * 1000).toLocaleString()}</li>
                      <li>Status: {tokens.expires_at > Math.floor(Date.now() / 1000) ? "Valid" : "Expired"}</li>
                    </ul>
                  </div>

                  {athlete && (
                    <div>
                      <p className="font-medium mb-2">Athlete Information:</p>
                      <ul className="list-disc pl-5">
                        <li>ID: {athlete.id}</li>
                        <li>
                          Name: {athlete.firstname} {athlete.lastname}
                        </li>
                        <li>
                          Location: {athlete.city}, {athlete.country}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 text-red-800 rounded-md">
                    <p className="font-medium">❌ Not connected to Strava</p>
                    <p>No Strava tokens found. Please connect your Strava account.</p>
                  </div>

                  <StravaConnect />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Check if all required environment variables are set</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  {validation.credentials.hasClientId ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span>STRAVA_CLIENT_ID</span>
                </li>
                <li className="flex items-center">
                  {validation.credentials.hasClientSecret ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span>STRAVA_CLIENT_SECRET</span>
                </li>
                <li className="flex items-center">
                  {validation.credentials.hasPublicClientId ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span>NEXT_PUBLIC_STRAVA_CLIENT_ID</span>
                </li>
                <li className="flex items-center">
                  {validation.credentials.hasTokens ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span>Strava Tokens (access_token, refresh_token, expires_at)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot">
          <StravaTroubleshooter />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strava API Configuration</CardTitle>
              <CardDescription>Details about your Strava API application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Strava API Application</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Strava API application settings should match the following configuration:
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Client ID: {process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || "Not set"}</li>
                    <li>
                      Authorization Callback Domain:{" "}
                      {typeof window !== "undefined" ? window.location.origin : "Not available"}
                    </li>
                    <li>Required Scopes: activity:read, activity:read_all</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Redirect URI</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    The redirect URI used for Strava authentication is:
                  </p>
                  <div className="p-3 bg-muted rounded-md text-sm font-mono break-all">
                    {typeof window !== "undefined" ? `${window.location.origin}/api/strava/auth` : "Not available"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This exact URI must be authorized in your Strava API application settings.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Environment Variables</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Make sure these environment variables are set in your Vercel project:
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>STRAVA_CLIENT_ID</li>
                    <li>STRAVA_CLIENT_SECRET</li>
                    <li>NEXT_PUBLIC_STRAVA_CLIENT_ID</li>
                    <li>STRAVA_ACCESS_TOKEN</li>
                    <li>STRAVA_REFRESH_TOKEN</li>
                    <li>STRAVA_EXPIRES_AT</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reconnect Strava</CardTitle>
              <CardDescription>Reconnect your Strava account to refresh tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you're experiencing issues with your Strava integration, try reconnecting your account to refresh
                  the tokens.
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <StravaConnect />

                  <a
                    href="https://www.strava.com/settings/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Manage Strava Apps
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
