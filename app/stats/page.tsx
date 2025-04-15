import { StatsView } from "@/components/stats-view"

export default function StatsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Stats & History</h1>
      <StatsView />
    </div>
  )
}
