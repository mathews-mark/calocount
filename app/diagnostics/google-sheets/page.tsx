"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { GoogleSpreadsheet } from "google-spreadsheet"

export default function GoogleSheetsDiagnostics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheets, setSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [cellData, setCellData] = useState<Record<string, any>>({})
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [directValues, setDirectValues] = useState<any>(null)
  const [doc, setDoc] = useState<GoogleSpreadsheet | null>(null)

  useEffect(() => {
    // Just fetch sheets list via API instead of initializing with credentials
    fetchSheets()
  }, [])

  // Fetch sheets list
  const fetchSheets = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/diagnostics/sheets")
      const data = await response.json()

      if (data.success) {
        setSheets(data.sheets)
        if (data.sheets.length > 0) {
          setSelectedSheet(data.sheets[0])
        }
      } else {
        setError(data.error || "Failed to fetch sheets")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Fetch API targets
  useEffect(() => {
    async function fetchApiTargets() {
      try {
        const response = await fetch("/api/targets")
        const data = await response.json()
        setApiResponse(data)
      } catch (err) {
        console.error("Error fetching API targets:", err)
      }
    }

    fetchApiTargets()
  }, [])

  // Fetch sheet data when a sheet is selected
  useEffect(() => {
    if (!selectedSheet) return

    async function fetchSheetData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/diagnostics/sheet-data?sheet=${selectedSheet}`)
        const data = await response.json()

        if (data.success) {
          setCellData(data.cells || {})
        } else {
          setError(data.error || "Failed to fetch sheet data")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchSheetData()
  }, [selectedSheet])

  // Fetch via API instead of directly using client credentials
  const fetchDirectly = async () => {
    try {
      setLoading(true)

      // Call our secure API endpoint instead of using credentials directly
      const response = await fetch("/api/diagnostics/direct-sheets-data")

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setDirectValues(data.result)
      } else {
        throw new Error(data.error || "Unknown error occurred")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Google Sheets Diagnostics</h1>

      {/* API Response */}
      <Card>
        <CardHeader>
          <CardTitle>API Targets Response</CardTitle>
          <CardDescription>Data returned from /api/targets endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          {apiResponse ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">{JSON.stringify(apiResponse, null, 2)}</pre>
          ) : (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheets List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Sheets</CardTitle>
          <CardDescription>Sheets found in the Google Spreadsheet</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {sheets.map((sheet) => (
                  <Button
                    key={sheet}
                    variant={selectedSheet === sheet ? "default" : "outline"}
                    onClick={() => setSelectedSheet(sheet)}
                  >
                    {sheet}
                  </Button>
                ))}
              </div>

              {sheets.length === 0 && <div className="text-muted-foreground">No sheets found</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet Data */}
      {selectedSheet && (
        <Card>
          <CardHeader>
            <CardTitle>Sheet Data: {selectedSheet}</CardTitle>
            <CardDescription>Cell values from the selected sheet</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">{JSON.stringify(cellData, null, 2)}</pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Direct Fetch (Client-side) */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Client-side Fetch</CardTitle>
          <CardDescription>Attempt to fetch directly from client (requires public env vars)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={fetchDirectly} disabled={loading || !doc}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Fetch Directly"
              )}
            </Button>

            {directValues && (
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(directValues, null, 2)}
              </pre>
            )}

            {error && <div className="text-destructive">{error}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
