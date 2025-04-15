import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { addEntryToSheet } from "@/lib/google-sheets"
import { getLocalEntries, saveLocalEntry } from "@/lib/local-storage"
import type { CalorieEntry } from "@/types/calorie-entry"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { date, adjustment, targetCalories } = data

    if (!date || adjustment === undefined || targetCalories === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create a new entry to add the calories
    const newEntry: CalorieEntry = {
      id: uuidv4(),
      date,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mealName: `Calorie Adjustment (${adjustment >= 0 ? "+" : ""}${adjustment})`,
      calories: targetCalories,
      protein: Math.round((targetCalories * 0.1) / 4), // Estimate protein at 10% of calories
      carbs: Math.round((targetCalories * 0.5) / 4), // Estimate carbs at 50% of calories
      fat: Math.round((targetCalories * 0.4) / 9), // Estimate fat at 40% of calories
      portion: 1,
      notes: `Automatic adjustment to reach ${targetCalories} calories for the day.`,
    }

    // Save to Google Sheets
    await addEntryToSheet(newEntry)

    // Save to local storage
    const localEntries = getLocalEntries()
    saveLocalEntry([...localEntries, newEntry])

    return NextResponse.json({ success: true, entry: newEntry })
  } catch (error) {
    console.error("Error adjusting calories:", error)
    return NextResponse.json({ success: false, error: "Failed to adjust calories" }, { status: 500 })
  }
}
