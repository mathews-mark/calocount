import { AddEntryForm } from "@/components/add-entry-form"

export default function HomePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Calorie Tracker</h1>
      <AddEntryForm />
    </div>
  )
}
