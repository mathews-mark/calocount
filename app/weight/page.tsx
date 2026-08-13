import { WeightTracker } from "@/components/weight-tracker"
import { PageHeader } from "@/components/page-header"

export default function WeightPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="Weight" description="Log your weight and watch the trend over time" />
      <WeightTracker />
    </div>
  )
}
