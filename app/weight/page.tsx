import { WeightTracker } from "@/components/weight-tracker"

export default function WeightPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Weight Tracker</h1>
      <WeightTracker />
    </div>
  )
}
