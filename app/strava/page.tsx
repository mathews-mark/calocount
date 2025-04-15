import { Suspense } from "react"
import { getStravaAthlete } from "@/lib/strava"
import { StravaConnect } from "@/components/strava-connect"
import { StravaProfile } from "@/components/strava-profile"
import { StravaActivities } from "@/components/strava-activities"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { StravaDebugLinks } from "@/components/strava-debug-links"

export default async function StravaPage() {
  const athlete = await getStravaAthlete()
  const isConnected = !!athlete

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Strava Integration</h1>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-lg">Connect your Strava account to import your activities and track calories burned.</p>
          <StravaConnect />
        </div>
      ) : (
        <div className="space-y-8">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your Strava account has been connected successfully. You can now view your activities below.
            </AlertDescription>
          </Alert>

          <Suspense fallback={<div>Loading profile...</div>}>
            <StravaProfile athlete={athlete} />
          </Suspense>

          <h2 className="text-2xl font-bold mt-8">Recent Activities</h2>
          <Suspense fallback={<div>Loading activities...</div>}>
            <StravaActivities />
          </Suspense>
        </div>
      )}
      <StravaDebugLinks />
    </div>
  )
}
