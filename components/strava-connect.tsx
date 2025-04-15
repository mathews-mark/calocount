"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StravaConnect() {
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<{
    clientId: string | null
    redirectUri: string | null
  } | null>(null)

  const handleConnect = () => {
    try {
      // Get the client ID from environment variable
      const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID

      if (!clientId) {
        setError("Strava client ID not found in environment variables")
        return
      }

      // Construct the redirect URI
      const redirectUri = `${window.location.origin}/api/strava/callback`

      // Store debug info
      setDebugInfo({
        clientId: clientId,
        redirectUri: redirectUri,
      })

      // Log the redirect URI for debugging
      console.log("Strava Auth Debug Info:", {
        clientId,
        redirectUri,
        origin: window.location.origin,
      })

      // Construct the authorization URL with both activity:read and activity:read_all scopes
      const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=activity:read,activity:read_all`

      // Log the full auth URL for debugging
      console.log("Auth URL:", authUrl)

      // Redirect to the Strava authorization page
      window.location.href = authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      console.error("Error in Strava connect:", err)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && (
        <div className="p-4 bg-muted rounded-md text-xs overflow-auto">
          <p className="font-bold mb-2">Debug Info:</p>
          <p>Client ID: {debugInfo.clientId}</p>
          <p>Redirect URI: {debugInfo.redirectUri}</p>
          <p className="mt-2 text-muted-foreground">
            Make sure this redirect URI is authorized in your Strava API settings.
          </p>
        </div>
      )}

      <Button
        onClick={handleConnect}
        className="bg-[#FC4C02] hover:bg-[#E34402] text-white font-bold py-2 px-4 rounded flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Connect with Strava
      </Button>
    </div>
  )
}
