"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function StravaTokenValidator() {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<any>(null)

  const validateToken = async () => {
    setIsValidating(true)
    setValidationResults(null)

    try {
      const response = await fetch("/api/strava/test")
      const data = await response.json()
      setValidationResults(data)

      if (data.success) {
        toast({
          title: "Validation successful",
          description: "Your Strava integration is working correctly.",
        })
      } else {
        toast({
          title: "Validation failed",
          description: "There are issues with your Strava integration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating token:", error)
      toast({
        title: "Validation error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    if (status === true) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getOverallStatus = () => {
    if (!validationResults) return null

    if (validationResults.success) {
      return (
        <div className="flex items-center gap-2 text-green-500 font-medium">
          <CheckCircle className="h-5 w-5" />
          Integration is working correctly
        </div>
      )
    } else if (validationResults.tokens && validationResults.tokens.available) {
      return (
        <div className="flex items-center gap-2 text-yellow-500 font-medium">
          <AlertTriangle className="h-5 w-5" />
          Integration has issues
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-red-500 font-medium">
          <XCircle className="h-5 w-5" />
          Integration is not working
        </div>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strava Token Validator</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={validateToken} disabled={isValidating}>
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            "Validate Strava Token"
          )}
        </Button>

        {validationResults && (
          <div className="mt-4 space-y-4">
            {getOverallStatus()}

            <div className="grid gap-4 mt-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="font-medium">Tokens Available</div>
                <div className="flex items-center gap-2">{getStatusIcon(validationResults.tokens.available)}</div>
              </div>

              {validationResults.tokens.available && (
                <>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">Token Valid</div>
                    <div className="flex items-center gap-2">{getStatusIcon(validationResults.tokens.valid)}</div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">Token Expired</div>
                    <div className="flex items-center gap-2">{getStatusIcon(!validationResults.tokens.expired)}</div>
                  </div>

                  {validationResults.tokens.expired && (
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="font-medium">Token Refreshable</div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(validationResults.tokens.refreshable)}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between border-b pb-2">
                <div className="font-medium">Athlete Profile</div>
                <div className="flex items-center gap-2">{getStatusIcon(validationResults.athlete.success)}</div>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="font-medium">Activities</div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(validationResults.activities.success)}
                  {validationResults.activities.success && (
                    <span className="text-sm text-muted-foreground">({validationResults.activities.count} found)</span>
                  )}
                </div>
              </div>
            </div>

            {validationResults.tokens.details && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Token Details</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Expires At:</span>{" "}
                    {validationResults.tokens.details.expires_at_formatted || "Unknown"}
                  </div>
                  {validationResults.tokens.details.time_until_expiry && (
                    <div>
                      <span className="font-medium">Time Until Expiry:</span>{" "}
                      {Math.floor(validationResults.tokens.details.time_until_expiry / 60)} minutes
                    </div>
                  )}
                  {validationResults.tokens.details.refreshed && (
                    <div>
                      <span className="font-medium">New Expiry:</span>{" "}
                      {validationResults.tokens.details.new_expires_at_formatted}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(validationResults.athlete.error || validationResults.activities.error) && (
              <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
                <h3 className="font-medium mb-2">Errors</h3>
                {validationResults.athlete.error && (
                  <div className="text-sm">
                    <span className="font-medium">Athlete Error:</span> {validationResults.athlete.error}
                  </div>
                )}
                {validationResults.activities.error && (
                  <div className="text-sm">
                    <span className="font-medium">Activities Error:</span> {validationResults.activities.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
