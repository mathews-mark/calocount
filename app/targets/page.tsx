import { TargetsTracker } from "@/components/targets-tracker"
import { TargetsHistory } from "@/components/targets-history"

export default function TargetsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Targets Tracker</h1>
      <TargetsTracker />
      <TargetsHistory />
    </div>
  )
}
