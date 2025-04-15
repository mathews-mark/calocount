"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Import the MobileLink component
import { MobileLink } from "@/components/mobile-link"

export default function SettingsPage() {
  const [spreadsheetId, setSpreadsheetId] = useState("")
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "success" | "error">("unknown")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const [credentials, setCredentials] = useState<any>(null)

  useEffect(() => {
    fetchSpreadsheetUrl()
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const response = await fetch("/api/credentials")
      const data = await response.json()

      if (data.success) {
        setCredentials(data.credentials)
      }
    } catch (error) {
      console.error("Error fetching credentials:", error)
    }
  }

  const fetchSpreadsheetUrl = async () => {
    setIsLoadingUrl(true)

    try {
      const response = await fetch("/api/spreadsheet-url")
      const data = await response.json()

      if (data.success) {
        setSpreadsheetUrl(data.url)

        // Extract spreadsheet ID from URL
        const idMatch = data.url.match(/\/d\/([a-zA-Z0-9-_]+)\//)
        if (idMatch && idMatch[1]) {
          setSpreadsheetId(idMatch[1])
        }
      }
    } catch (error) {
      console.error("Error fetching spreadsheet URL:", error)
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    setConnectionStatus("unknown")
    setConnectionDetails(null)

    try {
      const response = await fetch("/api/debug/test-google-sheets", {
        method: "POST",
      })

      const data = await response.json()
      setConnectionDetails(data)

      if (data.success) {
        setConnectionStatus("success")
        toast({
          title: "Connection successful",
          description: "Successfully connected to Google Sheets",
        })
      } else {
        setConnectionStatus("error")
        toast({
          title: "Connection failed",
          description: data.error || "Failed to connect to Google Sheets",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitializeSpreadsheet = async () => {
    setIsInitializing(true)

    try {
      const response = await fetch("/api/initialize-spreadsheet", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Spreadsheet initialized",
          description: "The spreadsheet has been successfully initialized with the required structure",
        })

        // Refresh the spreadsheet URL
        fetchSpreadsheetUrl()
      } else {
        toast({
          title: "Initialization failed",
          description: data.error || "Failed to initialize the spreadsheet",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Initialization error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="google-sheets">
        <TabsList>
          <TabsTrigger value="google-sheets">Google Sheets</TabsTrigger>
          <TabsTrigger value="app-settings">App Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="google-sheets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Sheets Integration</CardTitle>
              <CardDescription>Configure the Google Sheets integration for storing your calorie data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spreadsheet-id">Current Spreadsheet ID</Label>
                <div className="flex gap-2">
                  <Input id="spreadsheet-id" value={spreadsheetId} readOnly className="font-mono" />
                  <Button variant="outline" size="icon" onClick={fetchSpreadsheetUrl} disabled={isLoadingUrl}>
                    <RefreshCw className={`h-4 w-4 ${isLoadingUrl ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  To use a different spreadsheet, update the GOOGLE_SPREADSHEET_ID environment variable in your Vercel
                  project settings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleTestConnection} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>

                <Button
                  onClick={handleInitializeSpreadsheet}
                  disabled={isInitializing}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Spreadsheet"
                  )}
                </Button>

                {spreadsheetUrl && (
                  <MobileLink href={spreadsheetUrl} className="w-full sm:w-auto">
                    Open Spreadsheet
                  </MobileLink>
                )}
              </div>

              {connectionStatus === "success" && (
                <div className="p-3 bg-green-50 text-green-800 rounded-md">
                  Connection successful! Your app is properly connected to Google Sheets.
                </div>
              )}

              {connectionStatus === "error" && (
                <div className="p-3 bg-red-50 text-red-800 rounded-md">
                  Connection failed. Please check your Google Sheets configuration and permissions.
                </div>
              )}

              {connectionDetails && (
                <div className="mt-4">
                  <Label>Connection Details</Label>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto text-xs">
                    {JSON.stringify(connectionDetails, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h3 className="font-semibold mb-2">Troubleshooting Tips</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Make sure your service account has Editor access to the spreadsheet</li>
                <li>Click "Initialize Spreadsheet" to create the required structure</li>
                <li>If you're still having issues, check the Vercel logs for detailed error messages</li>
              </ul>
            </CardFooter>
          </Card>

          {credentials && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Service Account Credentials</CardTitle>
                <CardDescription>These credentials are loaded from the service account JSON file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project ID</Label>
                  <Input value={credentials.projectId} readOnly className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input value={credentials.clientEmail} readOnly className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Private Key Length</Label>
                  <Input value={`${credentials.privateKeyLength} characters`} readOnly className="font-mono" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  These credentials are embedded in the application and will be used for Google Sheets integration.
                </p>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="app-settings">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">App settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
