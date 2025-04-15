// This is a utility function that can be used if OpenAI API is not available
export function analyzeMealFallback(description: string) {
  // Simple algorithm to generate reasonable values based on the description
  const words = description.split(" ")
  const wordCount = words.length

  // Base values
  let calories = 250
  let protein = 15
  let carbs = 25
  let fat = 10

  // Adjust based on keywords
  const keywordAdjustments: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
    chicken: { calories: 50, protein: 10, carbs: -5, fat: 2 },
    beef: { calories: 80, protein: 8, carbs: 5, fat: 6 },
    fish: { calories: 40, protein: 12, carbs: 5, fat: 3 },
    rice: { calories: 60, protein: -2, carbs: 15, fat: -1 },
    pasta: { calories: 70, protein: 0, carbs: 20, fat: 0 },
    bread: { calories: 50, protein: 0, carbs: 12, fat: 1 },
    cheese: { calories: 40, protein: 3, carbs: 0, fat: 5 },
    salad: { calories: -30, protein: 0, carbs: 5, fat: -2 },
    vegetable: { calories: -20, protein: 0, carbs: 5, fat: -1 },
    fruit: { calories: 30, protein: -1, carbs: 10, fat: -1 },
    oil: { calories: 40, protein: 0, carbs: 0, fat: 5 },
    butter: { calories: 35, protein: 0, carbs: 0, fat: 4 },
    fried: { calories: 50, protein: 0, carbs: 5, fat: 6 },
    grilled: { calories: -20, protein: 2, carbs: -2, fat: -2 },
    baked: { calories: -10, protein: 0, carbs: 0, fat: -1 },
  }

  // Apply adjustments based on keywords in the description
  const lowerDesc = description.toLowerCase()
  Object.entries(keywordAdjustments).forEach(([keyword, adjustment]) => {
    if (lowerDesc.includes(keyword)) {
      calories += adjustment.calories
      protein += adjustment.protein
      carbs += adjustment.carbs
      fat += adjustment.fat
    }
  })

  // Adjust based on description length (longer descriptions usually mean more food)
  const lengthFactor = Math.min(1.5, Math.max(0.8, wordCount / 10))
  calories = Math.round(calories * lengthFactor)
  protein = Math.round(protein * lengthFactor)
  carbs = Math.round(carbs * lengthFactor)
  fat = Math.round(fat * lengthFactor)

  // Ensure minimum values
  calories = Math.max(50, calories)
  protein = Math.max(0, protein)
  carbs = Math.max(0, carbs)
  fat = Math.max(0, fat)

  return {
    calories,
    protein,
    carbs,
    fat,
  }
}
