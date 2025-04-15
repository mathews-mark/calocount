export interface Entry {
  id: string
  date: string
  time: string
  mealName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  portion: number
  photoUrl?: string
  notes?: string
}
