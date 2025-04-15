"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StravaActivityDebugger() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/strava/debug-activities")
      const data = await response.json()
      setResult(data)

      // Log the full response to console for additional debugging
      console.log("Strava Debug Response:", data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error fetching debug data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Strava Activity Request Debugger</CardTitle>
        <CardDescription>See exactly what happens when requesting activities from Strava</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={fetchDebugData} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching data...
            </>
          ) : (
            "Debug Strava Activities Request"
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Success:</div>
              <div className={result.success ? "text-green-600" : "text-red-600"}>{result.success ? "Yes" : "No"}</div>

              <div className="font-medium">Status Code:</div>
              <div>{result.statusCode}</div>

              <div className="font-medium">Status Text:</div>
              <div>{result.statusText}</div>

              <div className="font-medium">Activities Count:</div>
              <div>{result.activitiesCount || 0}</div>
            </div>

            {result.tokenInfo && (
              <div className="border rounded-md p-3 space-y-2">
                <h3 className="font-medium">Token Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Access Token:</div>
                  <div>{result.tokenInfo.accessTokenPrefix || "None"}</div>

                  <div>Refresh Token:</div>
                  <div>{result.tokenInfo.refreshTokenPrefix || "None"}</div>

                  <div>Expires At:</div>
                  <div>{result.tokenInfo.expiresAt || "Unknown"}</div>

                  <div>Is Expired:</div>
                  <div className={result.tokenInfo.isExpired ? "text-red-600" : "text-green-600"}>
                    {result.tokenInfo.isExpired ? "Yes" : "No"}
                  </div>

                  <div>Time Until Expiration:</div>
                  <div>{result.tokenInfo.timeUntilExpiration || "Unknown"}</div>
                </div>
              </div>
            )}

            {result.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="parsed" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="parsed">Parsed Data</TabsTrigger>
                <TabsTrigger value="raw">Raw Response</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>

              <TabsContent value="parsed" className="mt-2">
                <ScrollArea className="h-60 w-full rounded-md border p-2">
                  <pre className="text-xs whitespace-pre-wrap">
                    {result.parsedData ? JSON.stringify(result.parsedData, null, 2) : "No parsed data available"}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="raw" className="mt-2">
                <ScrollArea className="h-60 w-full rounded-md border p-2">
                  <pre className="text-xs whitespace-pre-wrap">{result.rawResponse || "No raw response available"}</pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="headers" className="mt-2">
                <ScrollArea className="h-60 w-full rounded-md border p-2">
                  <pre className="text-xs whitespace-pre-wrap">
                    {result.headers ? JSON.stringify(result.headers, null, 2) : "No headers available"}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
