"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function CredentialsDebugPage() {
  const [credentials, setCredentials] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/credentials")
      const data = await response.json()
      setCredentials(data)
    } catch (error) {
      console.error("Error fetching credentials:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Credentials Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div>
              <h3 className="font-medium mb-2">Current Credentials:</h3>
              <pre className="p-4 bg-gray-100 rounded-md overflow-auto text-xs">
                {JSON.stringify(credentials, null, 2)}
              </pre>

              <Button onClick={fetchCredentials} className="mt-4">
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
