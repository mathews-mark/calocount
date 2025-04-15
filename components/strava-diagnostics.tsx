"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Export as a named export to match the import in the page
export function StravaDiagnostics() {
  const [isLoading, setIsLoading] = useState(true)
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [apiTest, setApiTest] = useState<any>(null)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [rawResponse, setRawResponse] = useState<string | null>(null)

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

  const testActivitiesApi = async () => {
    setIsTestingApi(true)
    setApiTest(null)
    setRawResponse(null)

    try {
      const response = await fetch("/api/strava/activities")
      const rawText = await response.text()
      setRawResponse(rawText)

      try {
        const data = JSON.parse(rawText)
        setApiTest({
          status: response.status,
          success: response.ok,
          data: data,
        })
      } catch (e) {
        setApiTest({
          status: response.status,
          success: false,
          error: "Failed to parse JSON response",
          rawResponse: rawText,
        })
      }
    } catch (error) {
      console.error("Error testing API:", error)
      setApiTest({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingApi(false)
    }
  }

  const testDirectApi = async () => {
    setIsTestingApi(true)
    setApiTest(null)
    setRawResponse(null)

    try {
      const response = await fetch("/api/strava/test")
      const rawText = await response.text()
      setRawResponse(rawText)

      try {
        const data = JSON.parse(rawText)
        setApiTest({
          status: response.status,
          success: response.ok,
          data: data,
        })
      } catch (e) {
        setApiTest({
          status: response.status,
          success: false,
          error: "Failed to parse JSON response",
          rawResponse: rawText,
        })
      }
    } catch (error) {
      console.error("Error testing direct API:", error)
      setApiTest({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingApi(false)
    }
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === false) return <XCircle className="h-5 w-5 text-red-500" />
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Strava Connection Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !diagnosticResults ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to run diagnostics</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">Environment Variables</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(
                      diagnosticResults.env?.hasClientId &&
                        diagnosticResults.env?.hasClientSecret &&
                        diagnosticResults.env?.hasPublicClientId,
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">Access Token</div>
                  <div className="flex items-center gap-2">{getStatusIcon(diagnosticResults.tokens?.accessToken)}</div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">Token Expiration</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!diagnosticResults.tokens?.isExpired)}
                    <span>
                      {diagnosticResults.tokens?.expiresAt
                        ? new Date(diagnosticResults.tokens.expiresAt * 1000).toLocaleString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={runDiagnostics} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Activities API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 w-full">
              <Button onClick={testActivitiesApi} disabled={isTestingApi} className="flex-1">
                {isTestingApi ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Activities API"
                )}
              </Button>

              <Button onClick={testDirectApi} disabled={isTestingApi} variant="outline" className="flex-1">
                {isTestingApi ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Direct Strava Test"
                )}
              </Button>
            </div>

            {apiTest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span className={apiTest.success ? "text-green-600" : "text-red-600"}>
                    {apiTest.status || "Error"}
                  </span>
                </div>

                {apiTest.success ? (
                  <>
                    <div>
                      <span className="font-medium">Activities:</span> {apiTest.data?.activities?.length || 0}
                    </div>

                    {apiTest.data?.activities?.length > 0 ? (
                      <ScrollArea className="h-40 w-full rounded-md border p-2">
                        <pre className="text-xs">{JSON.stringify(apiTest.data.activities[0], null, 2)}</pre>
                      </ScrollArea>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No activities found. This could be because you haven't recorded any activities or because the
                          app doesn't have the correct permissions.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div>
                    <span className="font-medium">Error:</span> {apiTest.error || "Unknown error"}
                    {rawResponse && (
                      <ScrollArea className="h-40 w-full rounded-md border p-2">
                        <pre className="text-xs">{rawResponse}</pre>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
