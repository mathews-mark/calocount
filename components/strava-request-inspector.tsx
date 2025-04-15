"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Send, Trash } from "lucide-react"

export function StravaRequestInspector() {
  const [url, setUrl] = useState("https://www.strava.com/api/v3/athlete/activities?per_page=1")
  const [accessToken, setAccessToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [requestHistory, setRequestHistory] = useState<Array<{ url: string; success: boolean }>>([])

  // Load access token on component mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/strava/token")
        const data = await response.json()

        if (data.success && data.accessToken) {
          setAccessToken(data.accessToken)
        }
      } catch (error) {
        console.error("Error fetching token:", error)
      }
    }

    fetchToken()
  }, [])

  // Update the makeRequest function to ensure proper headers and error handling
  const makeRequest = async () => {
    if (!url || !accessToken) {
      setError("URL and access token are required")
      return
    }

    setIsLoading(true)
    setResponse(null)
    setError(null)

    try {
      // Log the request details for debugging
      console.log(`Making request to: ${url}`)
      console.log(`Using token: ${accessToken.substring(0, 5)}...`)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Add proper content type and accept headers
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      let data

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      })

      // Add to history
      setRequestHistory((prev) => [
        { url, success: response.ok },
        ...prev.slice(0, 9), // Keep only the 10 most recent requests
      ])
    } catch (error) {
      console.error("Error making request:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setRequestHistory([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strava API Request Inspector</CardTitle>
        <CardDescription>Make direct requests to the Strava API for troubleshooting</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="request">
          <TabsList>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">API Endpoint URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.strava.com/api/v3/athlete/activities?per_page=1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Access Token</Label>
              <Input
                id="token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                type="password"
                placeholder="Your Strava access token"
              />
            </div>

            <Button onClick={makeRequest} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-md mt-4">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Common endpoints:</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>https://www.strava.com/api/v3/athlete (Get authenticated athlete)</li>
                <li>https://www.strava.com/api/v3/athlete/activities (Get activities)</li>
                <li>https://www.strava.com/api/v3/athlete/stats (Get athlete stats)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="response">
            {response ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">
                    Status: {response.status} {response.statusText}
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-2">Headers:</p>
                  <pre className="p-3 bg-muted rounded-md overflow-auto text-xs max-h-40">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="font-medium mb-2">Response Body:</p>
                  <pre className="p-3 bg-muted rounded-md overflow-auto text-xs max-h-80">
                    {typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Make a request to see the response</div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {requestHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Recent Requests</p>
                  <Button variant="outline" size="sm" onClick={clearHistory}>
                    <Trash className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </div>

                <div className="space-y-2">
                  {requestHistory.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md cursor-pointer hover:bg-muted ${
                        item.success ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
                      }`}
                      onClick={() => {
                        setUrl(item.url)
                        // Switch to request tab
                        const requestTab = document.querySelector('[data-value="request"]') as HTMLElement
                        if (requestTab) requestTab.click()
                      }}
                    >
                      <p className="font-medium truncate">{item.url}</p>
                      <p className={`text-sm ${item.success ? "text-green-600" : "text-red-600"}`}>
                        {item.success ? "Success" : "Failed"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No request history yet</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
