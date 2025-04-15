"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2, Plus, Minus, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { CalorieEntry, PortionOption } from "@/types/calorie-entry"

interface EditEntryFormProps {
  entry: CalorieEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedEntry: CalorieEntry) => void
  onDelete: (id: string) => void
}

const portionOptions: { value: PortionOption; label: string }[] = [
  { value: 0.25, label: "1/4" },
  { value: 0.33, label: "1/3" },
  { value: 0.5, label: "1/2" },
  { value: 0.75, label: "3/4" },
  { value: 1, label: "1" },
  { value: 1.25, label: "1.25" },
  { value: 1.5, label: "1.5" },
  { value: 1.75, label: "1.75" },
  { value: 2.0, label: "2" },
  { value: 3.0, label: "3" },
  { value: 4.0, label: "4" },
  { value: 5.0, label: "5" },
  { value: 6.0, label: "6" },
  { value: 7.0, label: "7" },
  { value: 8.0, label: "8" },
  { value: 9.0, label: "9" },
  { value: 10.0, label: "10" },
]

export function EditEntryForm({ entry, open, onOpenChange, onSave, onDelete }: EditEntryFormProps) {
  // Form state
  const [mealName, setMealName] = useState("")
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [portion, setPortion] = useState<PortionOption>(1)
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState(format(new Date(), "HH:mm"))
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Base values (before portion adjustment)
  const [baseCalories, setBaseCalories] = useState(0)
  const [baseProtein, setBaseProtein] = useState(0)
  const [baseCarbs, setBaseCarbs] = useState(0)
  const [baseFat, setBaseFat] = useState(0)

  // Update form when entry changes
  useEffect(() => {
    if (entry) {
      setMealName(entry.mealName)

      // Calculate base values (before portion adjustment)
      setBaseCalories(Math.round(entry.calories / entry.portion))
      setBaseProtein(Number((entry.protein / entry.portion).toFixed(1)))
      setBaseCarbs(Number((entry.carbs / entry.portion).toFixed(1)))
      setBaseFat(Number((entry.fat / entry.portion).toFixed(1)))

      // Set current values
      setCalories(entry.calories)
      setProtein(entry.protein)
      setCarbs(entry.carbs)
      setFat(entry.fat)
      setPortion(entry.portion)
      setNotes(entry.notes || "")

      // Set date and time with timezone adjustment
      // First, create a date object from the entry's date string
      const entryDate = new Date(entry.date)

      // Adjust for timezone to ensure correct display
      // We need to handle the timezone differently when loading vs saving
      // When loading, we want to display the date as it was entered, not adjusted
      setDate(entryDate)
      setTime(entry.time)
    }
  }, [entry])

  // Update calculated values when portion or base values change
  useEffect(() => {
    // Dynamic calorie adjustment based on portion
    setCalories(Math.round(baseCalories * portion))
    setProtein(Number.parseFloat((baseProtein * portion).toFixed(1)))
    setCarbs(Number.parseFloat((baseCarbs * portion).toFixed(1)))
    setFat(Number.parseFloat((baseFat * portion).toFixed(1)))
  }, [portion, baseCalories, baseProtein, baseCarbs, baseFat])

  // Increment calories by 25
  const incrementCalories = () => {
    const newBaseCalories = baseCalories + 25
    setBaseCalories(newBaseCalories)
  }

  // Decrement calories by 25
  const decrementCalories = () => {
    const newBaseCalories = Math.max(0, baseCalories - 25)
    setBaseCalories(newBaseCalories)
  }

  // Function to correct timezone issues
  const getTimezoneAdjustedDate = (inputDate: Date): string => {
    // Create a new date object to avoid mutating the original
    const dateToAdjust = new Date(inputDate)

    // Get the timezone offset in minutes and convert to milliseconds
    const timezoneOffset = dateToAdjust.getTimezoneOffset() * 60000

    // Adjust the date by adding the timezone offset
    const adjustedDate = new Date(dateToAdjust.getTime() + timezoneOffset)

    // Format as YYYY-MM-DD
    return format(adjustedDate, "yyyy-MM-dd")
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry) return

    setIsLoading(true)

    try {
      // Get timezone adjusted date for saving
      const adjustedDateStr = getTimezoneAdjustedDate(date)

      // Create the updated entry with the adjusted date
      const updatedEntry: CalorieEntry = {
        ...entry,
        date: adjustedDateStr,
        time,
        mealName,
        calories,
        protein,
        carbs,
        fat,
        portion,
        notes,
      }

      console.log("Submitting updated entry:", updatedEntry)

      // Save the updated entry to the API
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEntry),
      })

      const data = await response.json()

      if (data.success) {
        // Call the onSave callback with the updated entry
        onSave(updatedEntry)

        // Show success message
        toast({
          title: "Entry updated",
          description: "Your food entry has been updated successfully in Google Sheets.",
          variant: "default",
        })
      } else {
        throw new Error(data.error || "Failed to update entry")
      }
    } catch (error) {
      console.error("Error updating entry:", error)

      // Show error message
      toast({
        title: "Update failed",
        description: "There was an error updating your entry in Google Sheets. Changes saved locally only.",
        variant: "destructive",
      })

      // Even if the API call fails, we'll still update the entry locally
      if (entry) {
        const adjustedDateStr = getTimezoneAdjustedDate(date)

        const updatedEntry: CalorieEntry = {
          ...entry,
          date: adjustedDateStr,
          time,
          mealName,
          calories,
          protein,
          carbs,
          fat,
          portion,
          notes,
        }

        // Call the onSave callback with the updated entry
        onSave(updatedEntry)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!entry) return

    setIsDeleting(true)

    try {
      // Delete the entry from the API
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Call the onDelete callback
        onDelete(entry.id)

        // Close the dialog
        onOpenChange(false)

        // Show success message
        toast({
          title: "Entry deleted",
          description: "Your food entry has been deleted successfully from Google Sheets.",
          variant: "default",
        })
      } else {
        throw new Error(data.error || "Failed to delete entry")
      }
    } catch (error) {
      console.error("Error deleting entry:", error)

      // Show error message
      toast({
        title: "Delete failed",
        description: "There was an error deleting your entry from Google Sheets. Entry removed locally only.",
        variant: "destructive",
      })

      // Even if the API call fails, we'll still delete the entry locally
      onDelete(entry.id)
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Edit Food Entry</h2>
              <p className="text-sm text-muted-foreground">Make changes to your food entry below.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-meal-name">Food Name</Label>
              <Input id="edit-meal-name" value={mealName} onChange={(e) => setMealName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-portion">Portion</Label>
              <Select
                value={portion.toString()}
                onValueChange={(value) => setPortion(Number.parseFloat(value) as PortionOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select portion" />
                </SelectTrigger>
                <SelectContent>
                  {portionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-calories">Total Calories ({portion}x)</Label>
                <div className="text-sm text-muted-foreground">Base: {baseCalories} cal</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementCalories}
                  disabled={baseCalories <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input id="edit-calories" type="number" value={calories || ""} readOnly className="flex-1 bg-muted" />

                <Button type="button" variant="outline" size="icon" onClick={incrementCalories}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-protein">Protein ({portion}x)</Label>
                <div className="text-sm text-muted-foreground">Base: {baseProtein}g</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newBaseProtein = Math.max(0, baseProtein - 1)
                    setBaseProtein(newBaseProtein)
                  }}
                  disabled={baseProtein <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input id="edit-protein" type="number" value={protein || ""} readOnly className="flex-1 bg-muted" />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newBaseProtein = baseProtein + 1
                    setBaseProtein(newBaseProtein)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-carbs">Carbs ({portion}x)</Label>
                <div className="text-sm text-muted-foreground">Base: {baseCarbs}g</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newBaseCarbs = Math.max(0, baseCarbs - 1)
                    setBaseCarbs(newBaseCarbs)
                  }}
                  disabled={baseCarbs <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input id="edit-carbs" type="number" value={carbs || ""} readOnly className="flex-1 bg-muted" />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newBaseCarbs = baseCarbs + 1
                    setBaseCarbs(newBaseCarbs)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-fat">Fat ({portion}x)</Label>
                <div className="text-sm text-muted-foreground">Base: {baseFat}g</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newBaseFat = Math.max(0, baseFat - 1)
                    setBaseFat(newBaseFat)
                  }}
                  disabled={baseFat <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input id="edit-fat" type="number" value={fat || ""} readOnly className="flex-1 bg-muted" />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newBaseFat = baseFat + 1
                    setBaseFat(newBaseFat)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="edit-date" variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input id="edit-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes here"
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Entry"
                )}
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
