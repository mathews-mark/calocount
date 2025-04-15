"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type MealType = "breakfast" | "lunch" | "dinner" | "snack"

interface MealTypeSelectorProps {
  selected: MealType
  onChange: (value: MealType) => void
}

export function MealTypeSelector({ selected, onChange }: MealTypeSelectorProps) {
  return (
    <RadioGroup
      value={selected}
      onValueChange={(value) => onChange(value as MealType)}
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="breakfast" id="breakfast" />
        <Label htmlFor="breakfast">Breakfast</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="lunch" id="lunch" />
        <Label htmlFor="lunch">Lunch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="dinner" id="dinner" />
        <Label htmlFor="dinner">Dinner</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="snack" id="snack" />
        <Label htmlFor="snack">Snack</Label>
      </div>
    </RadioGroup>
  )
}
