"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function GoogleSheetsDebugPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const testGoogleSheets = async () => {
    setLoading(true)
    setResult("")

    try {
      const response = await fetch("/api/debug/test-google-sheets", {
        method: "POST",
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Integration Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testGoogleSheets} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Google Sheets Connection"
            )}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              <Textarea value={result} readOnly className="font-mono text-sm h-96" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
