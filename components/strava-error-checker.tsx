"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StravaErrorChecker() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/strava/troubleshoot")
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Strava Connection Status</h2>
        <Button onClick={runDiagnostics} disabled={loading} variant="outline" size="sm">
          {loading ? "Checking..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-4">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(results.environment.results).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className={value ? "text-green-600" : "text-red-600"}>{value ? "Present" : "Missing"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Token Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Token Status</CardTitle>
            </CardHeader>
            <CardContent>
              {!results.tokens.valid ? (
                <div className="text-red-600">{results.tokens.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={results.tokens.expired ? "text-red-600" : "text-green-600"}>
                      {results.tokens.expired ? "Expired" : "Valid"}
                    </span>
                  </div>
                  {results.tokens.expiresAt && (
                    <div className="flex justify-between">
                      <span>Expires At:</span>
                      <span>{new Date(results.tokens.expiresAt).toLocaleString()}</span>
                    </div>
                  )}
                  {results.tokens.timeRemaining && (
                    <div className="flex justify-between">
                      <span>Time Remaining:</span>
                      <span>{results.tokens.timeRemaining}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Connection</CardTitle>
            </CardHeader>
            <CardContent>
              {!results.api.success ? (
                <div className="text-red-600">{results.api.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Athlete:</span>
                    <span>
                      {results.api.athlete.firstname} {results.api.athlete.lastname}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activities Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {!results.activities.success ? (
                <div className="text-red-600">{results.activities.error}</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Activities Found:</span>
                    <span>{results.activities.count}</span>
                  </div>
                  {results.activities.count > 0 ? (
                    <div>
                      <div className="font-medium mt-2">Recent Activities:</div>
                      <ul className="list-disc pl-5 mt-1">
                        {results.activities.activities.slice(0, 3).map((activity: any) => (
                          <li key={activity.id}>
                            {activity.name} ({activity.type}) -
                            {activity.calories ? ` ${activity.calories} calories` : " No calories data"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-amber-600">No activities found in your Strava account.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Troubleshooting Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Troubleshooting Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!results.environment.allPresent && (
                <div>
                  <strong className="text-red-600">Missing Environment Variables</strong>
                  <p>Update your environment variables in your Vercel project settings.</p>
                </div>
              )}

              {results.tokens.valid && results.tokens.expired && (
                <div>
                  <strong className="text-red-600">Expired Tokens</strong>
                  <p>Your Strava tokens have expired. Reconnect with Strava to get new tokens.</p>
                </div>
              )}

              {results.api.success && !results.activities.success && (
                <div>
                  <strong className="text-amber-600">API Connected but Activities Failed</strong>
                  <p>Your Strava connection is working, but there was an error fetching activities.</p>
                </div>
              )}

              {results.activities.success && results.activities.count === 0 && (
                <div>
                  <strong className="text-amber-600">No Activities Found</strong>
                  <p>Your Strava account doesn't have any activities. Add some activities in Strava first.</p>
                </div>
              )}

              {results.api.success && results.activities.success && results.activities.count > 0 && (
                <div>
                  <strong className="text-green-600">Everything Looks Good!</strong>
                  <p>
                    Your Strava connection is working correctly. If you're still having issues, check your app's
                    implementation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
