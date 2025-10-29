"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import {
  Paper,
  Title,
  Text,
  Textarea,
  Button,
  NumberInput,
  Select,
  Group,
  Stack,
  Divider,
  Badge,
  ActionIcon,
  Popover,
  Card,
  Image,
  Loader,
  rem,
} from "@mantine/core"
import { DatePickerInput, TimeInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import {
  IconCamera,
  IconSparkles,
  IconPlus,
  IconMinus,
  IconHistory,
  IconClock,
  IconMicrophone,
  IconMicrophoneOff,
  IconCalendar,
  IconX,
} from "@tabler/icons-react"
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

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)

  // Voice input state
  const [isListening, setIsListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  // Fetch popular meals and recent entries on component mount
  useEffect(() => {
    fetchPopularMeals()
    fetchRecentEntries()
  }, [])

  // Update calculated values when portion or base values change
  useEffect(() => {
    setCalories(Math.round(baseCalories * portion))
    setProtein(Number.parseFloat((baseProtein * portion).toFixed(1)))
    setCarbs(Number.parseFloat((baseCarbs * portion).toFixed(1)))
    setFat(Number.parseFloat((baseFat * portion).toFixed(1)))
  }, [portion, baseCalories, baseProtein, baseCarbs, baseFat])

  // Initialize SpeechRecognition and set up its event handlers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsVoiceSupported(true)

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.maxAlternatives = 1 // Keep this for compatibility, though it's often ignored

        // iOS-specific: Add timeout to prevent hanging
        let recognitionTimeout: NodeJS.Timeout | null = null

        recognition.onresult = (event: any) => {
          console.log("[v0] Speech recognition result received")

          // Clear timeout on successful result
          if (recognitionTimeout) {
            clearTimeout(recognitionTimeout)
            recognitionTimeout = null
          }

          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            console.log("[v0] Final transcript:", finalTranscript)
            setDescription((prev) => (prev ? `${prev} ${finalTranscript}`.trim() : finalTranscript.trim()))
            setVoiceTranscript("")
          } else if (interimTranscript) {
            console.log("[v0] Interim transcript:", interimTranscript)
            setVoiceTranscript(interimTranscript)
          }
        }

        recognition.onerror = (event: any) => {
          console.error("[v0] Speech recognition error:", event.error)

          // Clear timeout on error
          if (recognitionTimeout) {
            clearTimeout(recognitionTimeout)
            recognitionTimeout = null
          }

          setIsListening(false)
          setVoiceTranscript("")

          // Use Mantine notifications for errors
          if (event.error !== "aborted") {
            // Don't show error for manual stops
            let errorMessage = "Failed to capture voice. Please try again."
            if (event.error === "no-speech") {
              errorMessage = "No speech detected. Please speak clearly and try again."
            } else if (event.error === "audio-capture") {
              errorMessage = "Microphone access denied. Please enable microphone permissions."
            } else if (event.error === "not-allowed") {
              errorMessage = "Microphone permission denied. Please allow microphone access in your browser settings."
            }
            notifications.show({
              title: "Voice input error",
              message: errorMessage,
              color: "red",
            })
          }
        }

        recognition.onend = () => {
          console.log("[v0] Speech recognition ended")

          // Clear timeout
          if (recognitionTimeout) {
            clearTimeout(recognitionTimeout)
            recognitionTimeout = null
          }

          setIsListening(false)
          setVoiceTranscript("")
        }

        recognition.onstart = () => {
          console.log("[v0] Speech recognition started")

          // Set a timeout for the recognition session
          recognitionTimeout = setTimeout(() => {
            console.log("[v0] Recognition timeout reached, stopping")
            if (recognitionRef.current && isListening) {
              recognitionRef.current.stop()
            }
          }, 60000) // 60 seconds max
        }

        recognitionRef.current = recognition
      }
    }

    // Cleanup function to stop recognition when the component unmounts
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [])

  // Fetch popular meals from the API
  const fetchPopularMeals = async () => {
    setIsLoadingMeals(true)
    try {
      const response = await fetch("/api/popular-meals?limit=10")
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
        // Sort by date and time, most recent first, and take the first 30
        const sortedEntries = data.entries
          .sort((a: CalorieEntry, b: CalorieEntry) => {
            const dateA = new Date(`${a.date}T${a.time}`)
            const dateB = new Date(`${b.date}T${b.time}`)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 30)

        setRecentEntries(sortedEntries)
      }
    } catch (error) {
      console.error("Error fetching recent entries:", error)
    } finally {
      setIsLoadingMeals(false)
    }
  }

  // Handle photo upload and date/time extraction
  const handlePhotoUpload = async (file: File) => {
    setIsLoading(true)

    try {
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Extract date and time from the photo metadata
      const { date: photoDate, time: photoTime } = await extractPhotoDateTime(file)

      // Set the date and time from the photo
      setDate(new Date(photoDate))
      setTime(photoTime)

      // Upload the file to the server
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setPhotoUrl(data.photoUrl)
        console.log(`Photo uploaded successfully. URL: ${data.photoUrl}`)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      notifications.show({
        title: "Photo upload error",
        message: "Failed to upload photo.",
        color: "red",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle camera button click, differentiating between mobile and desktop
  const handleCameraClick = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isMobile) {
      // Dynamically create an input element for file selection
      const input = document.createElement("input")
      input.type = "file"
      // Specify exact image types to avoid Google Drive option on iOS
      input.accept = "image/jpeg,image/png"

      // For iOS, the input needs to be temporarily added to the DOM to trigger the camera
      if (isIOS) {
        input.style.position = "absolute"
        input.style.top = "-1000px"
        document.body.appendChild(input)
      }

      // Handle file selection
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files[0]) {
          setPhoto(target.files[0])
          handlePhotoUpload(target.files[0])
        }
        // Clean up the input element for iOS
        if (isIOS && input.parentNode) {
          input.parentNode.removeChild(input)
        }
      }

      // Trigger the file input click
      input.click()
    } else if (fileInputRef.current) {
      // For desktop, trigger the hidden file input
      fileInputRef.current.click()
    }
  }

  // Handle file input change for desktop uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      handlePhotoUpload(file)
    }
  }

  // Handle selection of a popular meal
  const handleSelectPopularMeal = (meal: MealSuggestion) => {
    setMealName(meal.mealName)
    setBaseCalories(meal.calories)
    setBaseProtein(meal.protein)
    setBaseCarbs(meal.carbs)
    setBaseFat(meal.fat)
    setPortion(1) // Reset portion to 1 when selecting a meal
    // Use Mantine notifications
    notifications.show({
      title: "Meal selected",
      message: `Selected ${meal.mealName} from popular meals.`,
      color: "green",
    })
  }

  // Handle selection of a recent entry
  const handleSelectRecentEntry = (entry: CalorieEntry) => {
    setMealName(entry.mealName)
    // Calculate base values from the selected entry
    setBaseCalories(Math.round(entry.calories / entry.portion))
    setBaseProtein(Number((entry.protein / entry.portion).toFixed(1)))
    setBaseCarbs(Number((entry.carbs / entry.portion).toFixed(1)))
    setBaseFat(Number((entry.fat / entry.portion).toFixed(1)))
    setPortion(1) // Reset portion to 1 when selecting an entry
    // Use Mantine notifications
    notifications.show({
      title: "Entry selected",
      message: `Selected ${entry.mealName} from recent entries.`,
      color: "green",
    })
  }

  // Handle AI-powered meal analysis
  const handleEstimateCalories = async () => {
    // Require either description or photo for analysis
    if (!description && !photo) {
      notifications.show({
        title: "Input required",
        message: "Please enter a description or upload an image of your food.",
        color: "red",
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

      console.log("Sending request to analyze meal with natural language parsing...")

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

        notifications.show({
          title: "Meal analyzed!",
          message: "Calories and macros have been calculated for your meal.",
          color: "green",
        })
      } else {
        // Throw an error to be caught by the catch block
        throw new Error(result.error || "Unknown AI analysis error")
      }
    } catch (error) {
      console.error("Error analyzing meal:", error)
      // Use Mantine notifications for errors
      notifications.show({
        title: "Estimation failed",
        message: "Failed to estimate calories. Using default values instead.",
        color: "red",
      })

      // Set default values if description is available
      if (description) {
        setMealName(description)
        setBaseCalories(250)
        setBaseProtein(15)
        setBaseCarbs(25)
        setBaseFat(10)
      } else {
        // Fallback if no description either
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

  // Toggle voice input listening state
  const toggleVoiceInput = () => {
    // Check if SpeechRecognition is supported by the browser
    if (!recognitionRef.current) {
      notifications.show({
        title: "Voice input not supported",
        message: "Your browser doesn't support voice input. Please use Chrome, Edge, or Safari.",
        color: "red",
      })
      return
    }

    if (isListening) {
      console.log("[v0] Stopping voice recognition")
      try {
        recognitionRef.current.stop() // Stop the recognition
      } catch (error) {
        console.error("[v0] Error stopping recognition:", error)
      }
      setIsListening(false)
      setVoiceTranscript("")
    } else {
      try {
        console.log("[v0] Starting voice recognition")
        recognitionRef.current.start() // Start the recognition
        setIsListening(true)

        // Inform the user they are being listened to
        notifications.show({
          title: "Listening...",
          message:
            "Speak your meal description now. Recording will stop automatically after 60 seconds or when you tap 'Stop Recording'.",
          color: "blue",
        })
      } catch (error) {
        console.error("[v0] Error starting speech recognition:", error)
        setIsListening(false)
        notifications.show({
          title: "Voice input error",
          message: "Failed to start voice input. Please try again.",
          color: "red",
        })
      }
    }
  }

  // Handle form submission to save the calorie entry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true) // Set loading state to true

    try {
      // Construct the CalorieEntry object
      const entry: CalorieEntry = {
        id: uuidv4(), // Generate a unique ID
        date: format(date, "yyyy-MM-dd"), // Format the date
        time, // Use the current time
        mealName,
        calories,
        protein,
        carbs,
        fat,
        portion,
        photoUrl: photoUrl || "", // Include photo URL if available
        notes, // Include any additional notes
      }

      // Send the entry to the API
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify content type
        },
        body: JSON.stringify(entry), // Convert entry to JSON string
      })

      const data = await response.json()

      if (data.success) {
        // Call the onEntryAdded callback if it exists
        if (onEntryAdded) {
          onEntryAdded(entry)
        }

        // Reset form fields to their initial states
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
        setDate(new Date()) // Reset date to current date
        setTime(format(new Date(), "HH:mm")) // Reset time to current time

        // Refresh popular meals and recent entries lists
        fetchPopularMeals()
        fetchRecentEntries()

        // Show success notification using Mantine
        notifications.show({
          title: "Entry saved",
          message: "Your food entry has been saved successfully.",
          color: "green",
        })
      } else {
        // If API returns success: false, throw an error
        throw new Error(data.error || "Failed to save entry from API")
      }
    } catch (error) {
      console.error("Error saving entry:", error)
      // Show error notification using Mantine
      notifications.show({
        title: "Error",
        message: "Failed to save your food entry. Please try again.",
        color: "red",
      })
    } finally {
      setIsLoading(false) // Ensure loading state is reset
    }
  }

  return (
    <Paper shadow="sm" p="xl" radius="sm" withBorder style={{ borderWidth: 1, borderColor: "#e5e5e5" }}>
      <Stack gap="lg">
        <div>
          <Title order={2} mb="xs" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>
            Add Food Entry
          </Title>
          <Text c="dimmed" size="sm">
            Track your meals with AI-powered analysis
          </Text>
        </div>

        <Divider />

        <Stack gap="md">
          <div>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconSparkles size={20} />
                <Text fw={600} size="sm">
                  Describe your meal
                </Text>
              </Group>
              {isVoiceSupported && (
                <Button
                  variant={isListening ? "filled" : "light"}
                  color={isListening ? "red" : "dark"}
                  size="xs"
                  leftSection={isListening ? <IconMicrophoneOff size={16} /> : <IconMicrophone size={16} />}
                  onClick={toggleVoiceInput}
                  style={{ animation: isListening ? "pulse 1.5s infinite" : "none" }}
                >
                  {isListening ? "Stop Recording" : "Record"}
                </Button>
              )}
            </Group>
            <Textarea
              placeholder='Try: "2 slices of pizza and a coke" or "chicken breast with rice and broccoli"'
              value={description + (voiceTranscript ? ` ${voiceTranscript}` : "")}
              onChange={(e) => setDescription(e.currentTarget.value)}
              minRows={4}
              disabled={isListening}
              styles={{
                input: {
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: rem(15),
                  lineHeight: 1.6,
                },
              }}
            />
            {isListening && voiceTranscript && (
              <Text size="sm" c="dimmed" mt="xs" fs="italic">
                Listening: {voiceTranscript}
              </Text>
            )}
            <Text size="sm" c="dimmed" mt="xs" p="xs" style={{ backgroundColor: "#f5f5f5", borderRadius: 4 }}>
              💡 <strong>Tip:</strong> Include quantities and all items for best results
            </Text>
          </div>

          <Group grow>
            <Button
              variant="default"
              leftSection={<IconCamera size={18} />}
              onClick={handleCameraClick}
              styles={{ root: { borderColor: "#e5e5e5" } }}
            >
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                ? "Take Photo"
                : "Upload Photo"}
            </Button>
            <Button
              variant="filled"
              color="dark"
              leftSection={isEstimating ? <Loader size="xs" color="white" /> : <IconSparkles size={18} />}
              onClick={handleEstimateCalories}
              disabled={isEstimating}
            >
              {isEstimating ? "Analyzing..." : "Analyze"}
            </Button>
          </Group>

          {photoPreview && (
            <Card padding="xs" radius="sm" withBorder style={{ position: "relative" }}>
              <Image src={photoPreview || "/placeholder.svg"} alt="Food preview" height={200} fit="cover" radius="sm" />
              <ActionIcon
                variant="filled"
                color="red"
                size="sm"
                radius="xl"
                style={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => {
                  setPhoto(null)
                  setPhotoPreview(null)
                  setPhotoUrl(null)
                }}
              >
                <IconX size={16} />
              </ActionIcon>
            </Card>
          )}
        </Stack>

        <Divider />

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Textarea
              label="Food name"
              placeholder="e.g., Grilled Chicken Salad"
              value={mealName}
              onChange={(e) => setMealName(e.currentTarget.value)}
              required
              minRows={2}
              styles={{
                label: { fontWeight: 600, marginBottom: 8 },
                input: { fontSize: rem(15) },
              }}
            />

            <Group grow>
              <Popover width={320} position="bottom-start" shadow="md">
                <Popover.Target>
                  <Button
                    variant="default"
                    leftSection={<IconHistory size={18} />}
                    styles={{ root: { borderColor: "#e5e5e5" } }}
                  >
                    Popular Meals
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p="xs">
                  <Stack gap="xs" mah={240} style={{ overflowY: "auto" }}>
                    {isLoadingMeals ? (
                      <Group justify="center" p="md">
                        <Loader size="sm" />
                      </Group>
                    ) : popularMeals.length > 0 ? (
                      popularMeals.map((meal) => (
                        <Card
                          key={meal.mealName}
                          padding="xs"
                          radius="sm"
                          withBorder
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectPopularMeal(meal)}
                        >
                          <Text size="sm" fw={600}>
                            {meal.mealName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                          </Text>
                          <Badge size="xs" variant="light" mt={4}>
                            {meal.frequency}x
                          </Badge>
                        </Card>
                      ))
                    ) : (
                      <Text size="sm" c="dimmed" ta="center">
                        No popular meals found
                      </Text>
                    )}
                  </Stack>
                </Popover.Dropdown>
              </Popover>

              <Popover width={320} position="bottom-start" shadow="md">
                <Popover.Target>
                  <Button
                    variant="default"
                    leftSection={<IconClock size={18} />}
                    styles={{ root: { borderColor: "#e5e5e5" } }}
                  >
                    Recent Entries
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p="xs">
                  <Stack gap="xs" mah={240} style={{ overflowY: "auto" }}>
                    {isLoadingMeals ? (
                      <Group justify="center" p="md">
                        <Loader size="sm" />
                      </Group>
                    ) : recentEntries.length > 0 ? (
                      recentEntries.map((entry) => (
                        <Card
                          key={entry.id}
                          padding="xs"
                          radius="sm"
                          withBorder
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectRecentEntry(entry)}
                        >
                          <Text size="sm" fw={600}>
                            {entry.mealName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {entry.calories} cal | P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                          </Text>
                          <Text size="xs" c="dimmed" mt={4}>
                            {new Date(entry.date).toLocaleDateString()} at {entry.time}
                          </Text>
                        </Card>
                      ))
                    ) : (
                      <Text size="sm" c="dimmed" ta="center">
                        No recent entries found
                      </Text>
                    )}
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            </Group>

            <Select
              label="Portion"
              value={portion.toString()}
              onChange={(value) => setPortion(Number.parseFloat(value!) as PortionOption)}
              data={portionOptions.map((opt) => ({ value: opt.value.toString(), label: opt.label }))}
              styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
            />

            <div>
              <Group justify="space-between" mb={8}>
                <Text size="sm" fw={600}>
                  Total Calories ({portion}x)
                </Text>
                <Text size="sm" c="dimmed">
                  Base: {baseCalories} cal
                </Text>
              </Group>
              <Group>
                <ActionIcon
                  variant="default"
                  onClick={() => setBaseCalories(Math.max(0, baseCalories - 25))}
                  disabled={baseCalories <= 0}
                >
                  <IconMinus size={16} />
                </ActionIcon>
                <NumberInput value={calories} readOnly flex={1} styles={{ input: { backgroundColor: "#f5f5f5" } }} />
                <ActionIcon variant="default" onClick={() => setBaseCalories(baseCalories + 25)}>
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
            </div>

            <div>
              <Group justify="space-between" mb={8}>
                <Text size="sm" fw={600}>
                  Protein ({portion}x)
                </Text>
                <Text size="sm" c="dimmed">
                  Base: {baseProtein}g
                </Text>
              </Group>
              <Group>
                <ActionIcon
                  variant="default"
                  onClick={() => setBaseProtein(Math.max(0, baseProtein - 1))}
                  disabled={baseProtein <= 0}
                >
                  <IconMinus size={16} />
                </ActionIcon>
                <NumberInput value={protein} readOnly flex={1} styles={{ input: { backgroundColor: "#f5f5f5" } }} />
                <ActionIcon variant="default" onClick={() => setBaseProtein(baseProtein + 1)}>
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
            </div>

            <div>
              <Group justify="space-between" mb={8}>
                <Text size="sm" fw={600}>
                  Carbs ({portion}x)
                </Text>
                <Text size="sm" c="dimmed">
                  Base: {baseCarbs}g
                </Text>
              </Group>
              <Group>
                <ActionIcon
                  variant="default"
                  onClick={() => setBaseCarbs(Math.max(0, baseCarbs - 1))}
                  disabled={baseCarbs <= 0}
                >
                  <IconMinus size={16} />
                </ActionIcon>
                <NumberInput value={carbs} readOnly flex={1} styles={{ input: { backgroundColor: "#f5f5f5" } }} />
                <ActionIcon variant="default" onClick={() => setBaseCarbs(baseCarbs + 1)}>
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
            </div>

            <div>
              <Group justify="space-between" mb={8}>
                <Text size="sm" fw={600}>
                  Fat ({portion}x)
                </Text>
                <Text size="sm" c="dimmed">
                  Base: {baseFat}g
                </Text>
              </Group>
              <Group>
                <ActionIcon
                  variant="default"
                  onClick={() => setBaseFat(Math.max(0, baseFat - 1))}
                  disabled={baseFat <= 0}
                >
                  <IconMinus size={16} />
                </ActionIcon>
                <NumberInput value={fat} readOnly flex={1} styles={{ input: { backgroundColor: "#f5f5f5" } }} />
                <ActionIcon variant="default" onClick={() => setBaseFat(baseFat + 1)}>
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
            </div>

            <Group grow>
              <DatePickerInput
                label="Date"
                value={date}
                onChange={(value) => value && setDate(value)}
                leftSection={<IconCalendar size={18} />}
                maxDate={new Date()}
                styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
              />
              <TimeInput
                label="Time"
                value={time}
                onChange={(e) => setTime(e.currentTarget.value)}
                leftSection={<IconClock size={18} />}
                styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
              />
            </Group>

            <Textarea
              label="Notes (Optional)"
              placeholder="Add any additional notes here"
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              minRows={3}
              styles={{ label: { fontWeight: 600, marginBottom: 8 } }}
            />

            <Button
              type="submit"
              size="lg"
              color="dark"
              fullWidth
              disabled={isLoading}
              leftSection={isLoading ? <Loader size="xs" color="white" /> : null}
            >
              {isLoading ? "Saving..." : "Save Food Entry"}
            </Button>
          </Stack>
        </form>
      </Stack>

      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
    </Paper>
  )
}
