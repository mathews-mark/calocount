import { AddEntryForm } from "@/components/add-entry-form"

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Calorie Tracker
        </h1>
        <p className="text-muted-foreground text-lg">Track your nutrition with AI-powered insights</p>
      </div>
      <AddEntryForm />
    </div>
  )
}
