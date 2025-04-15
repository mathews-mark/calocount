"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { StravaTokenValidator } from "@/components/strava-token-validator"
import { toast } from "sonner"
import { StravaRequestInspector } from "@/components/strava-request-inspector"

export default function StravaTroubleshootPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/strava/diagnostics")
      const data = await response.json()
      setDiagnosticResults(data)
    } catch (error) {
      console.error("Error running diagnostics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const runTest = async () => {
    setIsRunningTest(true)
    setTestResults(null)
    try {
      const response = await fetch("/api/strava/test")
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error("Error running test:", error)
      setTestResults({ success: false, error: "Failed to run test" })
    } finally {
      setIsRunningTest(false)
    }
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === false) return <XCircle className="h-5 w-5 text-red-500" />
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Strava Troubleshooting</h1>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Check</CardTitle>
          <CardDescription>Checking if all required Strava environment variables are properly set</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !diagnosticResults ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to run diagnostics</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">STRAVA_CLIENT_ID</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.env.hasClientId)}
                    <span>{diagnosticResults.env.hasClientId ? "Set" : "Missing"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">NEXT_PUBLIC_STRAVA_CLIENT_ID</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.env.hasPublicClientId)}
                    <span>{diagnosticResults.env.hasPublicClientId ? "Set" : "Missing"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">STRAVA_CLIENT_SECRET</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.env.hasClientSecret)}
                    <span>{diagnosticResults.env.hasClientSecret ? "Set" : "Missing"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">STRAVA_ACCESS_TOKEN</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.env.hasAccessToken)}
                    <span>{diagnosticResults.env.hasAccessToken ? "Set" : "Missing"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">STRAVA_REFRESH_TOKEN</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.env.hasRefreshToken)}
                    <span>{diagnosticResults.env.hasRefreshToken ? "Set" : "Missing"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">STRAVA_EXPIRES_AT</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticResults.env.hasExpiresAt)}
                    <span>{diagnosticResults.env.hasExpiresAt ? "Set" : "Missing"}</span>
                  </div>
                </div>
              </div>

              {diagnosticResults.tokens && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Token Status</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Access Token:</span>{" "}
                      {diagnosticResults.tokens.accessToken ? "Present" : "Missing"}
                    </div>
                    <div>
                      <span className="font-medium">Refresh Token:</span>{" "}
                      {diagnosticResults.tokens.refreshToken ? "Present" : "Missing"}
                    </div>
                    <div>
                      <span className="font-medium">Expires At:</span>{" "}
                      {diagnosticResults.tokens.expiresAt
                        ? new Date(diagnosticResults.tokens.expiresAt * 1000).toLocaleString()
                        : "Unknown"}
                    </div>
                    <div>
                      <span className="font-medium">Token Status:</span>{" "}
                      {diagnosticResults.tokens.isExpired ? "Expired" : "Valid"}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={runDiagnostics}>Refresh Diagnostics</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Strava API</CardTitle>
          <CardDescription>Test the connection to Strava API and fetch activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} disabled={isRunningTest}>
            {isRunningTest ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run API Test"
            )}
          </Button>

          {testResults && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Test Results</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {testResults.success ? (
                    <span className="text-green-500 flex items-center">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Success
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <XCircle className="mr-1 h-4 w-4" /> Failed
                    </span>
                  )}
                </div>

                {testResults.success ? (
                  <>
                    <div>
                      <span className="font-medium">Activities Retrieved:</span> {testResults.activitiesCount}
                    </div>
                    {testResults.activitiesCount === 0 && (
                      <Alert variant="warning" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Activities Found</AlertTitle>
                        <AlertDescription>
                          This could be because you haven't recorded any activities recently, or because the app doesn't
                          have the correct permissions.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div>
                    <span className="font-medium">Error:</span> {testResults.error}
                  </div>
                )}

                {testResults.details && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(testResults.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <StravaTokenValidator />

      <Card>
        <CardHeader>
          <CardTitle>Request Logging</CardTitle>
          <CardDescription>Enable detailed request logging for Strava API calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.setItem("stravaDebugMode", "true")
                  toast({
                    title: "Debug mode enabled",
                    description: "Detailed Strava API logs will be shown in the console",
                  })
                }}
              >
                Enable Debug Mode
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("stravaDebugMode")
                  toast({
                    title: "Debug mode disabled",
                    description: "Detailed Strava API logs have been disabled",
                  })
                }}
              >
                Disable Debug Mode
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              When debug mode is enabled, all Strava API requests and responses will be logged to the browser console.
              This can help identify issues with the API integration.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Error Solutions</CardTitle>
          <CardDescription>Quick fixes for common Strava integration errors</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="401-error">
              <AccordionTrigger>401 Unauthorized Error</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Your access token is invalid or expired</li>
                  <li>Try reconnecting to Strava using the "Reconnect Strava" button</li>
                  <li>
                    After reconnecting, copy the new tokens from the console logs and update your environment variables
                  </li>
                  <li>Redeploy your application after updating the environment variables</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="403-error">
              <AccordionTrigger>403 Forbidden Error</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Your app doesn't have the required permissions</li>
                  <li>Make sure you're requesting the correct scopes (activity:read_all) during authorization</li>
                  <li>Go to Strava settings, revoke access to your app, then reconnect with the correct permissions</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="429-error">
              <AccordionTrigger>429 Too Many Requests Error</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>You've exceeded Strava's rate limits</li>
                  <li>Strava limits API requests to 100 requests per 15 minutes and 1000 per day</li>
                  <li>Implement caching to reduce the number of API calls</li>
                  <li>Wait for 15 minutes before trying again</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="no-activities">
              <AccordionTrigger>No Activities Found</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Check if you have activities in your Strava account</li>
                  <li>Verify that your app has the activity:read_all scope</li>
                  <li>Try reconnecting to Strava with the correct permissions</li>
                  <li>Check if the activities have privacy zones that might be restricting access</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="token-refresh-fails">
              <AccordionTrigger>Token Refresh Fails</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Your refresh token may be invalid or expired</li>
                  <li>Strava refresh tokens can expire if not used for a long time</li>
                  <li>Try reconnecting to Strava to get a new refresh token</li>
                  <li>Make sure your client ID and client secret are correct</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <StravaRequestInspector />

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
          <CardDescription>Follow these steps to resolve common Strava integration issues</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="missing-env">
              <AccordionTrigger>Missing Environment Variables</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Go to your Vercel project dashboard</li>
                  <li>Navigate to Settings → Environment Variables</li>
                  <li>
                    Make sure you have all of these variables set:
                    <ul className="list-disc pl-5 mt-1">
                      <li>STRAVA_CLIENT_ID</li>
                      <li>NEXT_PUBLIC_STRAVA_CLIENT_ID (same value as STRAVA_CLIENT_ID)</li>
                      <li>STRAVA_CLIENT_SECRET</li>
                      <li>STRAVA_ACCESS_TOKEN</li>
                      <li>STRAVA_REFRESH_TOKEN</li>
                      <li>STRAVA_EXPIRES_AT</li>
                    </ul>
                  </li>
                  <li>After adding missing variables, redeploy your application</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="token-issues">
              <AccordionTrigger>Token Issues</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    If your tokens are expired or invalid, try reconnecting to Strava:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Go to the Strava page in your app</li>
                      <li>Click "Connect Strava Account" or "Reconnect Strava"</li>
                      <li>Complete the authorization flow</li>
                    </ul>
                  </li>
                  <li>
                    After reconnecting, check the console logs for the new token values. You should see something like:
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs">
                      STRAVA_ACCESS_TOKEN=1234abcd...
                      <br />
                      STRAVA_REFRESH_TOKEN=5678efgh...
                      <br />
                      STRAVA_EXPIRES_AT=1234567890
                    </pre>
                  </li>
                  <li>
                    <strong>Important:</strong> Copy these values and update your environment variables in Vercel
                  </li>
                  <li>After updating the variables, redeploy your application</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="permission-issues">
              <AccordionTrigger>Permission Issues</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Make sure you're requesting the correct scopes during authorization:
                    <ul className="list-disc pl-5 mt-1">
                      <li>
                        The scope should include <code>activity:read_all</code> to access all activities
                      </li>
                      <li>
                        Check the authorization URL in <code>app/strava/page.tsx</code> and{" "}
                        <code>app/debug/strava/page.tsx</code>
                      </li>
                    </ul>
                  </li>
                  <li>
                    Verify your Strava app settings:
                    <ul className="list-disc pl-5 mt-1">
                      <li>
                        Go to{" "}
                        <a
                          href="https://www.strava.com/settings/api"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          Strava API Settings <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </li>
                      <li>Check that your app has the correct redirect URI</li>
                      <li>
                        The redirect URI should match your app's URL (e.g.,{" "}
                        <code>https://your-app-name.vercel.app</code>)
                      </li>
                    </ul>
                  </li>
                  <li>
                    Try revoking access and reconnecting:
                    <ul className="list-disc pl-5 mt-1">
                      <li>
                        Go to{" "}
                        <a
                          href="https://www.strava.com/settings/apps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          Strava Connected Apps <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </li>
                      <li>Revoke access to your app</li>
                      <li>Return to your app and reconnect with Strava</li>
                      <li>Make sure to update your environment variables with the new tokens</li>
                    </ul>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api-issues">
              <AccordionTrigger>API Issues</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Check the browser console and server logs for error messages:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Open your browser's developer tools (F12 or right-click → Inspect)</li>
                      <li>Go to the Console tab to see client-side errors</li>
                      <li>Check your Vercel logs for server-side errors</li>
                    </ul>
                  </li>
                  <li>
                    Verify that your Strava account has activities:
                    <ul className="list-disc pl-5 mt-1">
                      <li>
                        Log in to{" "}
                        <a
                          href="https://www.strava.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          Strava <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </li>
                      <li>Check if you can see your activities there</li>
                    </ul>
                  </li>
                  <li>
                    Test the API directly:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Use the "Run API Test" button above to test the API connection</li>
                      <li>Check the results for specific error messages</li>
                    </ul>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="deployment-issues">
              <AccordionTrigger>Deployment Issues</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Make sure your changes are deployed:
                    <ul className="list-disc pl-5 mt-1">
                      <li>After updating environment variables, redeploy your application</li>
                      <li>Check the deployment logs for any errors</li>
                    </ul>
                  </li>
                  <li>
                    Try a hard refresh of your browser:
                    <ul className="list-disc pl-5 mt-1">
                      <li>Press Ctrl+F5 or Cmd+Shift+R to clear the cache and reload</li>
                    </ul>
                  </li>
                  <li>Check if the issue persists in a different browser or incognito mode</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          <Alert className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              After reconnecting to Strava, you must update your environment variables with the new tokens shown in the
              console logs. The tokens are not automatically saved to your environment variables.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  )
}
