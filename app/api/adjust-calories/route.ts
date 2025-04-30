import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { addEntryToSheet } from "@/lib/google-sheets"
import { getLocalEntries, saveLocalEntry } from "@/lib/local-storage"
import type { CalorieEntry } from "@/types/calorie-entry"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { date, adjustment, currentTotal, targetCalories, caloriesNeeded } = data

    if (!date || adjustment === undefined || targetCalories === undefined || caloriesNeeded === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Calculate macros based on adjusted ratios with reduced protein
    // Protein: 15% of calories (4 calories per gram)
    // Carbs: 55% of calories (4 calories per gram)
    // Fat: 30% of calories (9 calories per gram)
    const protein = Math.round((caloriesNeeded * 0.15) / 4)
    const carbs = Math.round((caloriesNeeded * 0.55) / 4)
    const fat = Math.round((caloriesNeeded * 0.3) / 9)

    // Create a new entry to add the calories
    const newEntry: CalorieEntry = {
      id: uuidv4(),
      date,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mealName: `Calorie Adjustment (${adjustment >= 0 ? "+" : ""}${adjustment})`,
      calories: caloriesNeeded,
      protein: protein,
      carbs: carbs,
      fat: fat,
      portion: 1,
      notes: `Automatic adjustment to reach ${targetCalories} calories for the day. Current total was ${currentTotal}.`,
    }

    // Save to Google Sheets
    await addEntryToSheet(newEntry)

    // Save to local storage
    const localEntries = getLocalEntries()
    saveLocalEntry([...localEntries, newEntry])

    return NextResponse.json({
      success: true,
      entry: newEntry,
      debug: {
        date,
        adjustment,
        currentTotal,
        targetCalories,
        caloriesNeeded,
        macros: { protein, carbs, fat },
      },
    })
  } catch (error) {
    console.error("Error adjusting calories:", error)
    return NextResponse.json({ success: false, error: "Failed to adjust calories" }, { status: 500 })
  }
}
