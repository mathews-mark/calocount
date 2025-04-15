"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Camera, Plus, Loader2, Calculator, Minus, History, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { CalorieEntry, MealSuggestion, PortionOption } from "@/types/calorie-entry"
import { extractPhotoDateTime } from "@/lib/date-utils"

// Make the onEntryAdded prop optional
interface AddEntryFormProps {
  onEntryAdded?: (entry: CalorieEntry) => void
}

// Update the portionOptions array to include values from 2 to 10
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

export function AddEntryForm({ onEntryAdded }: AddEntryFormProps) {
  // Form state
  const [mealName, setMealName] = useState("")
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [portion, setPortion] = useState<PortionOption>(1)
  const [notes, setNotes] = useState("")
  const [description, setDescription] = useState("")

  // Base values (before portion adjustment)
  const [baseCalories, setBaseCalories] = useState(0)
  const [baseProtein, setBaseProtein] = useState(0)
  const [baseCarbs, setBaseCarbs] = useState(0)
  const [baseFat, setBaseFat] = useState(0)

  // Date and time
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState(format(new Date(), "HH:mm"))

  // Photo upload
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Popular and recent meals
  const [popularMeals, setPopularMeals] = useState<MealSuggestion[]>([])
  const [recentEntries, setRecentEntries] = useState<CalorieEntry[]>([])
  const [isLoadingMeals, setIsLoadingMeals] = useState(false)
  const [mealSelectorOpen, setMealSelectorOpen] = useState(false)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)

  // Fetch popular meals and recent entries on component mount
  useEffect(() => {
    fetchPopularMeals()
    fetchRecentEntries()
  }, [])

  // Update calculated values when portion or base values change
  useEffect(() => {
    // Dynamic calorie adjustment based on portion
    setCalories(Math.round(baseCalories * portion))
    setProtein(Number.parseFloat((baseProtein * portion).toFixed(1)))
    setCarbs(Number.parseFloat((baseCarbs * portion).toFixed(1)))
    setFat(Number.parseFloat((baseFat * portion).toFixed(1)))
  }, [portion, baseCalories, baseProtein, baseCarbs, baseFat])

  // Fetch popular meals from the API
  const fetchPopularMeals = async () => {
    setIsLoadingMeals(true)
    try {
      const response = await fetch("/api/popular-meals?limit=10") // Double the count from 5 to 10
      const data = await response.json()

      if (data.success) {
        setPopularMeals(data.popularMeals)
      }
    } catch (error) {
      console.error("Error fetching popular meals:", error)
    } finally {
      setIsLoadingMeals(false)
    }
  }

  // Fetch recent entries from the API
  const fetchRecentEntries = async () => {
    setIsLoadingMeals(true)
    try {
      // Get today's date and 30 days ago for a reasonable range
      const endDate = format(new Date(), "yyyy-MM-dd")
      const startDate = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")

      const response = await fetch(`/api/entries?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()

      if (data.success) {
        // Sort by date and time, most recent first, and take the first 5
        const sortedEntries = data.entries
          .sort((a: CalorieEntry, b: CalorieEntry) => {
            const dateA = new Date(`${a.date}T${a.time}`)
            const dateB = new Date(`${b.date}T${b.time}`)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 30) // Double the count from 15 to 30

        setRecentEntries(sortedEntries)
      }
    } catch (error) {
      console.error("Error fetching recent entries:", error)
    } finally {
      setIsLoadingMeals(false)
    }
  }

  // Then update the handlePhotoUpload function
  const handlePhotoUpload = async (file: File) => {
    setIsLoading(true)

    try {
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Extract date and time from the photo
      const { date: photoDate, time: photoTime } = await extractPhotoDateTime(file)

      // Set the date and time from the photo
      setDate(new Date(photoDate))
      setTime(photoTime)

      // Upload the file
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setPhotoUrl(data.photoUrl)

        // Log the extracted date and time
        console.log(`Photo date and time extracted: ${photoDate} ${photoTime}`)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Find the handleCameraClick function and replace it with this version that keeps the original functionality
  // but uses the more specific file types to avoid Google Drive options
  const handleCameraClick = () => {
    try {
      console.log("Camera button clicked")

      // Check if we're on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      console.log("Device detected as:", isMobile ? "Mobile" : "Desktop")

      if (isMobile) {
        console.log("Using mobile camera capture method")

        // For iOS devices, we need a special approach
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

        if (isIOS) {
          console.log("iOS device detected, using iOS-specific method")

          // iOS specific approach
          const input = document.createElement("input")
          input.type = "file"
          // Specify exact image types to avoid Google Drive option
          input.accept = "image/jpeg,image/png"

          // For iOS, we need to add it to the DOM temporarily
          input.style.position = "absolute"
          input.style.top = "-1000px"
          document.body.appendChild(input)

          input.onchange = (e) => {
            console.log("File input change event triggered")
            const target = e.target as HTMLInputElement
            if (target.files && target.files[0]) {
              console.log("File selected:", target.files[0].name)
              setPhoto(target.files[0])
              handlePhotoUpload(target.files[0])
            } else {
              console.log("No file selected")
            }

            // Clean up
            document.body.removeChild(input)
          }

          console.log("Clicking the input element")
          input.click()
        } else {
          console.log("Android or other mobile device, using standard capture method")

          // Standard mobile approach with capture attribute
          const input = document.createElement("input")
          input.type = "file"
          // Specify exact image types to avoid Google Drive option
          input.accept = "image/jpeg,image/png"
          input.capture = "environment" // Use the back camera

          input.onchange = (e) => {
            console.log("File input change event triggered")
            const target = e.target as HTMLInputElement
            if (target.files && target.files[0]) {
              console.log("File selected:", target.files[0].name)
              setPhoto(target.files[0])
              handlePhotoUpload(target.files[0])
            } else {
              console.log("No file selected")
            }
          }

          console.log("Clicking the input element")
          input.click()
        }
      } else if (fileInputRef.current) {
        console.log("Desktop device, using file input ref")
        fileInputRef.current.click()
      }
    } catch (error) {
      console.error("Error in camera click handler:", error)
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Failed to access camera",
        variant: "destructive",
      })
    }
  }

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      handlePhotoUpload(file)
    }
  }

  // Handle popular meal selection
  const handleSelectPopularMeal = (meal: MealSuggestion) => {
    setMealName(meal.mealName)
    setBaseCalories(meal.calories)
    setBaseProtein(meal.protein)
    setBaseCarbs(meal.carbs)
    setBaseFat(meal.fat)
    setPortion(1) // Reset portion to 1 when selecting a meal
    setMealSelectorOpen(false)

    toast({
      title: "Meal selected",
      description: `Selected ${meal.mealName} from popular meals.`,
    })
  }

  // Handle recent entry selection
  const handleSelectRecentEntry = (entry: CalorieEntry) => {
    setMealName(entry.mealName)
    setBaseCalories(Math.round(entry.calories / entry.portion))
    setBaseProtein(Number((entry.protein / entry.portion).toFixed(1)))
    setBaseCarbs(Number((entry.carbs / entry.portion).toFixed(1)))
    setBaseFat(Number((entry.fat / entry.portion).toFixed(1)))
    setPortion(1) // Reset portion to 1 when selecting an entry
    setMealSelectorOpen(false)

    toast({
      title: "Entry selected",
      description: `Selected ${entry.mealName} from recent entries.`,
    })
  }

  // Handle estimate calories
  const handleEstimateCalories = async () => {
    if (!description && !photo) {
      toast({
        title: "Input required",
        description: "Please enter a description or upload an image of your food.",
        variant: "destructive",
      })
      return
    }

    setIsEstimating(true)
    try {
      const formData = new FormData()

      if (description) {
        formData.append("description", description)
      }

      if (photo) {
        formData.append("image", photo)
      }

      console.log("Sending request to analyze meal...")

      const res = await fetch("/api/analyzeMeal", {
        method: "POST",
        body: formData,
      })

      console.log("Response status:", res.status)

      const result = await res.json()
      console.log("Response data:", result)

      if (result.success) {
        const { foodName, calories, protein, carbs, fat } = result.data

        // Use the AI-generated food name directly
        setMealName(foodName || description || "Unknown food")
        setBaseCalories(calories || 0)
        setBaseProtein(protein || 0)
        setBaseCarbs(carbs || 0)
        setBaseFat(fat || 0)

        toast({
          title: "Calories estimated",
          description: "The calories and macros have been estimated based on your input.",
        })
      } else {
        console.error("AI analysis failed:", result.error)
        toast({
          title: "Estimation failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        })

        // Set default values based on description
        if (description) {
          setMealName(description)
          // Set some reasonable default values
          setBaseCalories(250)
          setBaseProtein(15)
          setBaseCarbs(25)
          setBaseFat(10)
        }
      }
    } catch (error) {
      console.error("Error analyzing meal:", error)
      toast({
        title: "Estimation failed",
        description: "Failed to estimate calories. Using default values instead.",
        variant: "destructive",
      })

      // Set default values
      if (description) {
        setMealName(description)
        setBaseCalories(250)
        setBaseProtein(15)
        setBaseCarbs(25)
        setBaseFat(10)
      } else {
        setMealName("Unknown food")
        setBaseCalories(250)
        setBaseProtein(15)
        setBaseCarbs(25)
        setBaseFat(10)
      }
    } finally {
      setIsEstimating(false)
    }
  }

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create the entry object
      const entry: CalorieEntry = {
        id: uuidv4(),
        date: format(date, "yyyy-MM-dd"),
        time,
        mealName,
        calories,
        protein,
        carbs,
        fat,
        portion,
        photoUrl: photoUrl || "",
        notes,
      }

      // Save the entry to the API
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      })

      const data = await response.json()

      if (data.success) {
        // Call the onEntryAdded callback if provided
        if (onEntryAdded) {
          onEntryAdded(entry)
        }

        // Reset form
        setMealName("")
        setDescription("")
        setBaseCalories(0)
        setBaseProtein(0)
        setBaseCarbs(0)
        setBaseFat(0)
        setPortion(1)
        setNotes("")
        setPhoto(null)
        setPhotoPreview(null)
        setPhotoUrl(null)
        setDate(new Date())
        setTime(format(new Date(), "HH:mm"))

        // Refresh popular meals and recent entries
        fetchPopularMeals()
        fetchRecentEntries()

        // Show success message
        toast({
          title: "Entry saved",
          description: "Your food entry has been saved successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "Error",
        description: "Failed to save your food entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Food Entry</CardTitle>
        <CardDescription>Enter the details of your food item</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Update the form layout to be more mobile-friendly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Describe your meal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-24 sm:h-32"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  className="flex-1 flex items-center justify-center"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">
                    {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                      ? "Take Photo"
                      : "Upload Photo"}
                  </span>
                </Button>
                <Button type="button" onClick={handleEstimateCalories} disabled={isEstimating} className="flex-1">
                  {isEstimating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-xs sm:text-sm">Estimating...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Estimate</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {photoPreview && (
              <div className="relative">
                <Card className="overflow-hidden">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Food preview"
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                </Card>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPhoto(null)
                    setPhotoPreview(null)
                    setPhotoUrl(null)
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <Textarea
                id="edit-meal-name"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
                className="h-24 sm:h-32"
                placeholder="Food name"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    Popular Meals
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                    {isLoadingMeals ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : popularMeals.length > 0 ? (
                      popularMeals.map((meal) => (
                        <div
                          key={meal.mealName}
                          className="p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleSelectPopularMeal(meal)}
                        >
                          <div className="font-medium">{meal.mealName}</div>
                          <div className="text-sm text-muted-foreground">
                            {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Frequency: {meal.frequency}x</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">No popular meals found</div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Recent Entries
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                    {isLoadingMeals ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentEntries.length > 0 ? (
                      recentEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleSelectRecentEntry(entry)}
                        >
                          <div className="font-medium">{entry.mealName}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.calories} cal | P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.date).toLocaleDateString()} at {entry.time}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">No recent entries found</div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Moved portion selector above calories */}
            <div className="space-y-2">
              <Label htmlFor="portion">Portion</Label>
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
                <Label htmlFor="calories">Total Calories ({portion}x)</Label>
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

                <Input id="calories" type="number" value={calories || ""} readOnly className="flex-1 bg-muted" />

                <Button type="button" variant="outline" size="icon" onClick={incrementCalories}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="protein">Protein ({portion}x)</Label>
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

                <Input id="protein" type="number" value={protein || ""} readOnly className="flex-1 bg-muted" />

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
                <Label htmlFor="carbs">Carbs ({portion}x)</Label>
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

                <Input id="carbs" type="number" value={carbs || ""} readOnly className="flex-1 bg-muted" />

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
                <Label htmlFor="fat">Fat ({portion}x)</Label>
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

                <Input id="fat" type="number" value={fat || ""} readOnly className="flex-1 bg-muted" />

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
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-sm sm:text-base overflow-hidden"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="flex items-center">
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <div className="ml-2 text-muted-foreground hidden sm:flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-xs">Current time by default</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes here"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Food Entry"
              )}
            </Button>
          </form>
        </div>
      </CardContent>

      {/* Hidden file input for desktop browsers */}
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
    </Card>
  )
}
