export type PortionOption =
  | 0.25
  | 0.33
  | 0.5
  | 0.75
  | 1
  | 1.25
  | 1.5
  | 1.75
  | 2.0
  | 3.0
  | 4.0
  | 5.0
  | 6.0
  | 7.0
  | 8.0
  | 9.0
  | 10.0

export interface CalorieEntry {
  id: string
  date: string
  time: string
  mealName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  portion: PortionOption
  photoUrl?: string
  notes?: string
}

export interface MealSuggestion {
  mealName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  frequency: number
  similarNames: string[]
}
