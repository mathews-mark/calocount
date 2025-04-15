"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import WeightHistoryChart from "./weight-history-chart"

interface WeightEntry {
  id: string
  date: string
  time: string
  weight: number
  notes?: string
}

// Helper function to adjust for timezone offset - consistent with stats page
function adjustForTimezone(dateString: string): Date {
  // Parse the date string to a Date object
  const date = parseISO(dateString)
  // No longer adding an extra day
  return date
}

export function WeightTracker() {
  const [weight, setWeight] = useState<string>("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>(format(new Date(), "HH:mm"))
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(true)

  // Set current time when component mounts
  useEffect(() => {
    setTime(format(new Date(), "HH:mm"))
  }, [])

  // Fetch weight entries on component mount
  useEffect(() => {
    fetchWeightEntries()
  }, [])

  const fetchWeightEntries = async () => {
    setIsLoadingEntries(true)
    try {
      const response = await fetch("/api/weight")
      const data = await response.json()

      if (data.success) {
        setWeightEntries(data.entries)
      }
    } catch (error) {
      console.error("Error fetching weight entries:", error)
      toast({
        title: "Error",
        description: "Failed to load weight entries",
        variant: "destructive",
      })
    } finally {
      setIsLoadingEntries(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!weight || isNaN(Number.parseFloat(weight)) || Number.parseFloat(weight) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const weightEntry: WeightEntry = {
        id: uuidv4(),
        date: format(date, "yyyy-MM-dd"),
        time: time,
        weight: Number.parseFloat(weight),
        notes: notes || undefined,
      }

      const response = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(weightEntry),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Weight saved",
          description: "Your weight entry has been saved successfully",
        })

        // Reset form
        setWeight("")
        setDate(new Date())
        setTime(format(new Date(), "HH:mm"))
        setNotes("")

        // Refresh entries
        fetchWeightEntries()
      } else {
        throw new Error(data.error || "Failed to save weight entry")
      }
    } catch (error) {
      console.error("Error saving weight entry:", error)
      toast({
        title: "Error",
        description: "Failed to save weight entry",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Weight Entry</CardTitle>
          <CardDescription>Track your weight over time</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <div className="flex">
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Enter your weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                  <span className="ml-2 flex items-center text-muted-foreground">lbs</span>
                </div>
              </div>

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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Weight"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Weight History Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History Chart</CardTitle>
          <CardDescription>Visualize your weight progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEntries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : weightEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No weight entries found. Add your first entry above.
            </div>
          ) : (
            <div className="h-80">
              <WeightHistoryChart data={weightEntries} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight History Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History Table</CardTitle>
          <CardDescription>Detailed log of your weight entries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEntries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : weightEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No weight entries found. Add your first entry above.
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="grid grid-cols-4 font-medium p-3 border-b">
                <div>Date</div>
                <div>Time</div>
                <div>Weight</div>
                <div>Notes</div>
              </div>
              <div className="divide-y max-h-80 overflow-y-auto">
                {weightEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <div key={entry.id} className="grid grid-cols-4 p-3">
                      <div>{format(adjustForTimezone(entry.date), "MMM dd, yyyy")}</div>
                      <div>{entry.time || "N/A"}</div>
                      <div>{entry.weight} lbs</div>
                      <div className="text-muted-foreground">{entry.notes || "-"}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
