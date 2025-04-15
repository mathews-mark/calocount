import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatsHeader() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Nutrition Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Track your nutrition progress and see insights about your eating habits.
        </p>
      </CardContent>
    </Card>
  )
}
