import { StatsView } from "@/components/stats-view"
import { PageHeader } from "@/components/page-header"

export default function StatsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="Stats" description="Trends across your calories, macros, and habits" />
      <StatsView />
    </div>
  )
}
