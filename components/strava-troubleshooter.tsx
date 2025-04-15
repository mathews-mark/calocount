"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"
import { StravaRequestInspector } from "./strava-request-inspector"

interface TroubleshootingStep {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "success" | "error" | "warning"
  message?: string
}

export function StravaTroubleshooter() {
  const [steps, setSteps] = useState<TroubleshootingStep[]>([
    {
      id: "env_vars",
      title: "Check Environment Variables",
      description: "Verify that all required Strava environment variables are set",
      status: "pending",
    },
    {
      id: "tokens",
      title: "Check Strava Tokens",
      description: "Verify that Strava tokens exist and are valid",
      status: "pending",
    },
    {
      id: "api_access",
      title: "Test API Access",
      description: "Test access to the Strava API",
      status: "pending",
    },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<"pending" | "success" | "error" | "warning">("pending")

  const runDiagnostics = async () => {
    setIsRunning(true)
    setOverallStatus("pending")

    // Reset steps
    setSteps(steps.map((step) => ({ ...step, status: "pending", message: undefined })))

    // Step 1: Check environment variables
    await updateStep("env_vars", "running")
    try {
      const response = await fetch("/api/strava/diagnostics/env")
      const data = await response.json()

      if (data.success) {
        await updateStep("env_vars", "success", "All required environment variables are set")
      } else {
        await updateStep("env_vars", "error", `Missing environment variables: ${data.missing.join(", ")}`)
      }
    } catch (error) {
      await updateStep("env_vars", "error", error instanceof Error ? error.message : "Unknown error")
    }

    // Step 2: Check tokens
    await updateStep("tokens", "running")
    try {
      const response = await fetch("/api/strava/diagnostics/tokens")
      const data = await response.json()

      if (data.success) {
        await updateStep("tokens", "success", `Tokens are valid (expires: ${data.expiresAt})`)
      } else if (data.expired) {
        await updateStep("tokens", "warning", `Tokens are expired (expired: ${data.expiresAt})`)
      } else {
        await updateStep("tokens", "error", data.error || "No tokens found")
      }
    } catch (error) {
      await updateStep("tokens", "error", error instanceof Error ? error.message : "Unknown error")
    }

    // Step 3: Test API access
    await updateStep("api_access", "running")
    try {
      const response = await fetch("/api/strava/diagnostics/test")
      const data = await response.json()

      if (data.success) {
        await updateStep(
          "api_access",
          "success",
          `Successfully connected to Strava API (athlete: ${data.athlete.firstname} ${data.athlete.lastname})`,
        )
      } else {
        await updateStep("api_access", "error", data.error || "Failed to connect to Strava API")
      }
    } catch (error) {
      await updateStep("api_access", "error", error instanceof Error ? error.message : "Unknown error")
    }

    // Determine overall status
    const newSteps = [...steps]
    const hasError = newSteps.some((step) => step.status === "error")
    const hasWarning = newSteps.some((step) => step.status === "warning")

    setOverallStatus(hasError ? "error" : hasWarning ? "warning" : "success")
    setIsRunning(false)
  }

  const updateStep = async (id: string, status: TroubleshootingStep["status"], message?: string) => {
    setSteps((prevSteps) => prevSteps.map((step) => (step.id === id ? { ...step, status, message } : step)))

    // Add a small delay for UI feedback
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strava Integration Troubleshooter</CardTitle>
        <CardDescription>Diagnose and fix issues with your Strava integration</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diagnostics">
          <TabsList>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="api-tester">API Tester</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Strava Connection Diagnostics</h3>
              <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Diagnostics
                  </>
                )}
              </Button>
            </div>

            {overallStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">All checks passed!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your Strava integration is working correctly.
                </AlertDescription>
              </Alert>
            )}

            {overallStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Issues detected</AlertTitle>
                <AlertDescription className="text-red-700">
                  There are problems with your Strava integration. See details below.
                </AlertDescription>
              </Alert>
            )}

            {overallStatus === "warning" && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Potential issues detected</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  There are potential issues with your Strava integration. See details below.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 mt-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-md border ${
                    step.status === "success"
                      ? "border-green-200 bg-green-50"
                      : step.status === "error"
                        ? "border-red-200 bg-red-50"
                        : step.status === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : step.status === "running"
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <div>
                      {step.status === "pending" && <span className="text-gray-500">Pending</span>}
                      {step.status === "running" && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
                      {step.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {step.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {step.status === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>

                  {step.message && (
                    <p
                      className={`mt-2 text-sm ${
                        step.status === "success"
                          ? "text-green-700"
                          : step.status === "error"
                            ? "text-red-700"
                            : step.status === "warning"
                              ? "text-yellow-700"
                              : "text-gray-700"
                      }`}
                    >
                      {step.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Common Issues & Solutions:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Missing environment variables:</strong> Make sure all required Strava environment variables
                    are set in your Vercel project.
                  </span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Invalid client ID or secret:</strong> Verify that your client ID and secret match what's in
                    your Strava API application settings.
                  </span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Expired tokens:</strong> Try reconnecting your Strava account to refresh the tokens.
                  </span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Insufficient permissions:</strong> Make sure your Strava API application has the necessary
                    scopes (activity:read, activity:read_all).
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="api-tester">
            <StravaRequestInspector />
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Strava API Documentation</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Refer to the official Strava API documentation for detailed information about endpoints and
                authentication.
              </p>
              <a
                href="https://developers.strava.com/docs/reference/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center hover:underline"
              >
                Strava API Reference
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Strava API Settings</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Check your Strava API application settings to ensure the correct redirect URI and scopes.
              </p>
              <a
                href="https://www.strava.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center hover:underline"
              >
                Strava API Settings
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Strava Connected Apps</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Manage your connected Strava applications and revoke access if needed.
              </p>
              <a
                href="https://www.strava.com/settings/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center hover:underline"
              >
                Strava Connected Apps
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Run the diagnostics to identify specific issues</li>
                <li>Check your environment variables in Vercel</li>
                <li>Verify your Strava API application settings</li>
                <li>Try revoking access and reconnecting your Strava account</li>
                <li>Use the API tester to make direct requests to the Strava API</li>
                <li>Check the browser console and server logs for error messages</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
