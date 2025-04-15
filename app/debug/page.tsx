"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [supabaseUrl, setSupabaseUrl] = useState<string>("")
  const [hasAnonKey, setHasAnonKey] = useState<boolean>(false)
  const [hasServiceKey, setHasServiceKey] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("Not tested")
  const [testResult, setTestResult] = useState<string>("")

  useEffect(() => {
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const anonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setSupabaseUrl(url)
    setHasAnonKey(anonKey)

    // We can't check service key on client side
    setHasServiceKey(false)
  }, [])

  const testConnection = async () => {
    setConnectionStatus("Testing...")

    try {
      const response = await fetch("/api/debug/test-supabase", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setConnectionStatus("Connected successfully")
        setTestResult(JSON.stringify(result, null, 2))
      } else {
        setConnectionStatus("Connection failed")
        setTestResult(JSON.stringify(result, null, 2))
      }
    } catch (error) {
      setConnectionStatus("Error testing connection")
      setTestResult(error instanceof Error ? error.message : "Unknown error")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Environment Variables:</h3>
            <ul className="list-disc pl-5 mt-2">
              <li>
                NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl ? supabaseUrl : "Not set"}
                {supabaseUrl && !supabaseUrl.startsWith("https://") && (
                  <span className="text-red-500 ml-2">URL should start with https://</span>
                )}
              </li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {hasAnonKey ? "Set" : "Not set"}</li>
              <li>SUPABASE_SERVICE_ROLE_KEY: {hasServiceKey ? "Set" : "Cannot check on client side"}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Connection Test:</h3>
            <p className="mt-1">Status: {connectionStatus}</p>

            <Button onClick={testConnection} className="mt-2">
              Test Connection
            </Button>

            {testResult && <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-60">{testResult}</pre>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
