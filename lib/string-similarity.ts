import type { CalorieEntry, MealSuggestion } from "@/types/calorie-entry"

// Simple string similarity function (Levenshtein distance)
function getStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  // If the strings are identical, return 1 (maximum similarity)
  if (s1 === s2) return 1

  // If either string is empty, return 0 (no similarity)
  if (s1.length === 0 || s2.length === 0) return 0

  // Calculate Levenshtein distance
  const matrix: number[][] = []

  // Initialize matrix
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      )
    }
  }

  // Calculate similarity as 1 - normalized distance
  const maxLength = Math.max(s1.length, s2.length)
  const distance = matrix[s1.length][s2.length]

  return 1 - distance / maxLength
}

// Group similar meal names and calculate average macros
export function getMostPopularMeals(entries: CalorieEntry[], limit = 15): MealSuggestion[] {
  if (!entries || entries.length === 0) return []

  // Group entries by similar meal names
  const mealGroups: Record<string, CalorieEntry[]> = {}

  entries.forEach((entry) => {
    // Skip entries without a meal name
    if (!entry.mealName) return

    // Check if this meal is similar to any existing group
    let foundGroup = false
    for (const groupName in mealGroups) {
      const similarity = getStringSimilarity(entry.mealName, groupName)

      // If similarity is above threshold, add to this group
      if (similarity > 0.7) {
        mealGroups[groupName].push(entry)
        foundGroup = true
        break
      }
    }

    // If no similar group found, create a new one
    if (!foundGroup) {
      mealGroups[entry.mealName] = [entry]
    }
  })

  // Convert groups to MealSuggestion objects
  const mealSuggestions: MealSuggestion[] = Object.entries(mealGroups).map(([groupName, groupEntries]) => {
    // Calculate average macros
    const totalCalories = groupEntries.reduce((sum, entry) => sum + entry.calories, 0)
    const totalProtein = groupEntries.reduce((sum, entry) => sum + entry.protein, 0)
    const totalCarbs = groupEntries.reduce((sum, entry) => sum + entry.carbs, 0)
    const totalFat = groupEntries.reduce((sum, entry) => sum + entry.fat, 0)

    const avgCalories = Math.round(totalCalories / groupEntries.length)
    const avgProtein = Number((totalProtein / groupEntries.length).toFixed(1))
    const avgCarbs = Number((totalCarbs / groupEntries.length).toFixed(1))
    const avgFat = Number((totalFat / groupEntries.length).toFixed(1))

    // Collect all similar names
    const similarNames = Array.from(new Set(groupEntries.map((entry) => entry.mealName)))

    return {
      mealName: groupName,
      calories: avgCalories,
      protein: avgProtein,
      carbs: avgCarbs,
      fat: avgFat,
      frequency: groupEntries.length,
      similarNames,
    }
  })

  // Sort by frequency (most frequent first) and limit results
  return mealSuggestions.sort((a, b) => b.frequency - a.frequency).slice(0, limit)
}
