"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CameraButtonProps {
  onPhotoCapture: (file: File) => void
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  className?: string
}

export function CameraButton({ onPhotoCapture, variant = "default", className = "" }: CameraButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  const handleCameraClick = () => {
    try {
      setIsCapturing(true)
      console.log("Camera button clicked")

      // Create a file input element
      const input = document.createElement("input")
      input.type = "file"
      // Specify exact image types to avoid Google Drive option
      input.accept = "image/jpeg,image/png"
      // Use environment capture to use the back camera
      input.capture = "environment"

      // Handle file selection
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files[0]) {
          console.log("Photo captured:", target.files[0].name)
          onPhotoCapture(target.files[0])
        } else {
          console.log("No photo captured")
        }
        setIsCapturing(false)
      }

      // Trigger file selection
      input.click()
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Failed to access camera",
        variant: "destructive",
      })
      setIsCapturing(false)
    }
  }

  return (
    <Button onClick={handleCameraClick} disabled={isCapturing} variant={variant} className={className}>
      <Camera className="mr-2 h-4 w-4" />
      {isCapturing ? "Accessing Camera..." : "Take Photo"}
    </Button>
  )
}
