"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StravaConnectionDebugPage() {
  const [clientId, setClientId] = useState<string>("")
  const [redirectUri, setRedirectUri] = useState<string>("")
  const [authUrl, setAuthUrl] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get the client ID from environment variable
    const envClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || ""
    setClientId(envClientId)

    // Set the redirect URI
    const uri = `${window.location.origin}/api/strava/auth`
    setRedirectUri(uri)

    // Update the auth URL
    updateAuthUrl(envClientId, uri)
  }, [])

  const updateAuthUrl = (cid: string, uri: string) => {
    if (!cid || !uri) {
      setAuthUrl("")
      return
    }

    const url = `https://www.strava.com/oauth/authorize?client_id=${cid}&redirect_uri=${encodeURIComponent(
      uri,
    )}&response_type=code&scope=activity:read,activity:read_all`

    setAuthUrl(url)
  }

  const handleClientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newClientId = e.target.value
    setClientId(newClientId)
    updateAuthUrl(newClientId, redirectUri)
  }

  const handleRedirectUriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUri = e.target.value
    setRedirectUri(newUri)
    updateAuthUrl(clientId, newUri)
  }

  const handleConnect = () => {
    if (!clientId) {
      setError("Client ID is required")
      return
    }

    if (!redirectUri) {
      setError("Redirect URI is required")
      return
    }

    window.location.href = authUrl
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Strava Connection Debug</h1>

      <Card>
        <CardHeader>
          <CardTitle>Connection Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input id="clientId" value={clientId} onChange={handleClientIdChange} placeholder="Your Strava Client ID" />
            <p className="text-xs text-muted-foreground">
              This should match the Client ID in your Strava API application settings.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirectUri">Redirect URI</Label>
            <Input
              id="redirectUri"
              value={redirectUri}
              onChange={handleRedirectUriChange}
              placeholder="https://your-app.vercel.app/api/strava/auth"
            />
            <p className="text-xs text-muted-foreground">
              This must be authorized in your Strava API application settings.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authUrl">Authorization URL</Label>
            <div className="p-3 bg-muted rounded-md text-xs overflow-auto break-all">
              {authUrl || "Please provide Client ID and Redirect URI"}
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleConnect} className="bg-[#FC4C02] hover:bg-[#E34402] text-white" disabled={!authUrl}>
              Test Connection
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Verify your Client ID matches exactly what's in your Strava API settings</li>
              <li>Make sure your Redirect URI is authorized in your Strava API settings</li>
              <li>Check that your Client Secret is correctly set in your environment variables</li>
              <li>Ensure your Strava API application has the correct permissions</li>
              <li>Try revoking access in your Strava settings and reconnecting</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
