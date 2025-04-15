import { NextResponse } from "next/server"
import type { MealSuggestion } from "@/types/calorie-entry"
import { getAllEntries } from "@/lib/google-sheets"
import { getMostPopularMeals } from "@/lib/string-similarity"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the limit parameter from the request, default to 5
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "5", 10)

    // Get all entries from Google Sheets
    const entries = await getAllEntries()

    // Use the string similarity function to get popular meals with the specified limit
    const popularMeals = getMostPopularMeals(entries, limit)

    return NextResponse.json({ success: true, popularMeals })
  } catch (error) {
    console.error("Error fetching popular meals:", error)

    // Return sample data as fallback
    const fallbackMeals: MealSuggestion[] = [
      {
        mealName: "Chicken Salad",
        calories: 350,
        protein: 30,
        carbs: 15,
        fat: 18,
        frequency: 5,
        similarNames: ["Chicken Salad", "Grilled Chicken Salad"],
      },
      {
        mealName: "Oatmeal with Berries",
        calories: 280,
        protein: 8,
        carbs: 45,
        fat: 6,
        frequency: 4,
        similarNames: ["Oatmeal with Berries", "Berry Oatmeal"],
      },
      {
        mealName: "Scrambled Eggs",
        calories: 220,
        protein: 14,
        carbs: 2,
        fat: 16,
        frequency: 3,
        similarNames: ["Scrambled Eggs", "Eggs"],
      },
    ]

    return NextResponse.json({ success: true, popularMeals: fallbackMeals })
  }
}
