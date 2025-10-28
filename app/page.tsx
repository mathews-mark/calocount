import { AddEntryForm } from "@/components/add-entry-form"
import { Sparkles, TrendingUp, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-12 animate-fade-in">
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4 animate-scale-in">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Nutrition Tracking</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold gradient-text animate-slide-up">Track Your Nutrition</h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-slide-up">
          Smart calorie tracking with AI-powered meal analysis, voice input, and comprehensive nutrition insights
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border-2 hover:border-primary transition-all hover:scale-105 hover:shadow-lg">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">AI Analysis</h3>
            <p className="text-sm text-muted-foreground text-center">
              Describe your meal naturally and let AI calculate the nutrition
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border-2 hover:border-primary transition-all hover:scale-105 hover:shadow-lg">
            <div className="p-3 rounded-full bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Voice Input</h3>
            <p className="text-sm text-muted-foreground text-center">
              Record your meals hands-free with voice recognition
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border-2 hover:border-primary transition-all hover:scale-105 hover:shadow-lg">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Track Progress</h3>
            <p className="text-sm text-muted-foreground text-center">
              Monitor your nutrition trends and reach your goals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto animate-slide-up">
        <AddEntryForm />
      </div>
    </div>
  )
}
