import { TargetsTracker } from "@/components/targets-tracker"
import { TargetsHistory } from "@/components/targets-history"
import { PageHeader } from "@/components/page-header"

export default function TargetsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="Targets" description="Set your daily calorie and protein goals" />
      <TargetsTracker />
      <TargetsHistory />
    </div>
  )
}
