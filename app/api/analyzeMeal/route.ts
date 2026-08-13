import { type NextRequest, NextResponse } from "next/server"
import { generateText, Output } from "ai"
import { z } from "zod"

const nutritionSchema = z.object({
  foodName: z.string().describe("A detailed, natural food name capturing everything eaten"),
  calories: z.number().describe("Total calories for the entire meal"),
  protein: z.number().describe("Total protein in grams"),
  carbs: z.number().describe("Total carbohydrates in grams"),
  fat: z.number().describe("Total fat in grams"),
})

const SYSTEM_PROMPT = `You are a nutrition expert who excels at understanding natural language food descriptions.

When given a description like "2 slices of pizza and a coke" or "chicken breast with rice", you should:
1. Parse the quantities (e.g., "2 slices", "1 cup", "150g")
2. Identify all food items mentioned
3. Calculate total calories and macros for ALL items combined
4. Provide a detailed, natural food name that captures what was eaten

Examples:
- Input: "2 slices of pepperoni pizza and a coke"
  Output: { "foodName": "2 Slices Pepperoni Pizza and Coca-Cola", "calories": 650, "protein": 24, "carbs": 78, "fat": 26 }
- Input: "chicken breast with brown rice and broccoli"
  Output: { "foodName": "Grilled Chicken Breast with Brown Rice and Steamed Broccoli", "calories": 420, "protein": 45, "carbs": 42, "fat": 8 }

Be sure to:
- Account for ALL items mentioned in the description
- Use realistic portion sizes if not specified
- Calculate accurate total calories and macros for the entire meal
- Create a descriptive, detailed food name`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const description = formData.get("description") as string | null
    const imageFile = formData.get("image") as File | null

    if (!description && !imageFile) {
      return NextResponse.json(
        { success: false, error: "Either a description or an image is required" },
        { status: 400 },
      )
    }

    // Build the user message content (text + optional image)
    const userContent: Array<
      { type: "text"; text: string } | { type: "file"; mediaType: string; data: Uint8Array }
    > = []

    if (description && imageFile) {
      userContent.push({
        type: "text",
        text: `I ate: ${description}. Please analyze both the description and the image, and provide complete nutritional information for everything mentioned.`,
      })
    } else if (imageFile) {
      userContent.push({
        type: "text",
        text: "What food is in this image? Please identify all items and provide detailed nutritional information for the complete meal.",
      })
    } else if (description) {
      userContent.push({
        type: "text",
        text: `I ate: ${description}. Please parse this description, identify all food items and quantities, and provide complete nutritional information for the entire meal.`,
      })
    }

    if (imageFile) {
      const bytes = new Uint8Array(await imageFile.arrayBuffer())
      userContent.push({
        type: "file",
        mediaType: imageFile.type || "image/jpeg",
        data: bytes,
      })
    }

    console.log("[v0] Sending meal analysis request to AI Gateway...")

    const result = await generateText({
      model: "openai/gpt-4o", // vision-capable model via Vercel AI Gateway
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      output: Output.object({ schema: nutritionSchema }),
    })

    const data = result.output
    console.log("[v0] Meal analysis result:", data)

    return NextResponse.json({
      success: true,
      data: {
        foodName: data.foodName,
        calories: data.calories,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
      },
    })
  } catch (error) {
    // Surface the real error instead of silently returning "Unknown food"
    const message = error instanceof Error ? error.message : "Failed to analyze meal"
    console.error("[v0] Error analyzing meal:", message)
    return NextResponse.json({ success: false, error: message }, { status: 502 })
  }
}
