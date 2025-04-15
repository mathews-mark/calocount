import { StravaErrorChecker } from "@/components/strava-error-checker"

export default function StravaErrorsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Strava Error Checker</h1>
      <StravaErrorChecker />
    </div>
  )
}
