"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Smartphone, ComputerIcon as Desktop, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function CameraDebug() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [cameraPermission, setCameraPermission] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [photoTaken, setPhotoTaken] = useState<boolean>(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      const isMobileDevice = mobileRegex.test(userAgent)
      setIsMobile(isMobileDevice)
      addDebugInfo(`Device detected as: ${isMobileDevice ? "Mobile" : "Desktop"}`)
      addDebugInfo(`User Agent: ${userAgent}`)
    }

    // Check if camera is available
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((device) => device.kind === "videoinput")
        setHasCamera(cameras.length > 0)
        addDebugInfo(`Cameras detected: ${cameras.length}`)

        if (cameras.length > 0) {
          cameras.forEach((camera, index) => {
            addDebugInfo(`Camera ${index + 1}: ${camera.label || "Label not available"}`)
          })
        }
      } catch (err) {
        setHasCamera(false)
        setLastError(`Error checking camera: ${err instanceof Error ? err.message : String(err)}`)
        addDebugInfo(`Error checking camera: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Check camera permission
    const checkPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName })
        setCameraPermission(permissionStatus.state)
        addDebugInfo(`Camera permission status: ${permissionStatus.state}`)

        permissionStatus.onchange = () => {
          setCameraPermission(permissionStatus.state)
          addDebugInfo(`Camera permission changed to: ${permissionStatus.state}`)
        }
      } catch (err) {
        setCameraPermission("unknown")
        addDebugInfo(`Error checking camera permission: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    checkMobile()
    checkCamera()
    checkPermission()
  }, [])

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${info}`])
  }

  const handleDirectCameraAccess = () => {
    try {
      addDebugInfo("Direct camera access button clicked")

      const input = document.createElement("input")
      input.type = "file"
      // Specify exact image types to avoid Google Drive option
      input.accept = "image/jpeg,image/png"
      input.capture = "environment" // Use the back camera

      addDebugInfo("Created file input with capture attribute")

      input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          addDebugInfo(`File selected: ${target.files[0].name}, size: ${target.files[0].size} bytes`)
          setPhotoTaken(true)
          toast({
            title: "Photo captured",
            description: `Captured photo: ${target.files[0].name}, size: ${target.files[0].size} bytes`,
          })
        } else {
          addDebugInfo("No file selected")
        }
      }

      addDebugInfo("Clicking the input element")
      input.click()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setLastError(errorMessage)
      addDebugInfo(`Error in direct camera access: ${errorMessage}`)
      toast({
        title: "Camera error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleAlternativeMethod = () => {
    try {
      addDebugInfo("Alternative method button clicked")

      // Try a different approach for iOS
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"

      // Don't set capture attribute for this method
      addDebugInfo("Created file input without capture attribute")

      input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          addDebugInfo(`File selected: ${target.files[0].name}, size: ${target.files[0].size} bytes`)
          setPhotoTaken(true)
          toast({
            title: "Photo captured",
            description: `Captured photo: ${target.files[0].name}, size: ${target.files[0].size} bytes`,
          })
        } else {
          addDebugInfo("No file selected")
        }
      }

      addDebugInfo("Clicking the input element")
      input.click()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setLastError(errorMessage)
      addDebugInfo(`Error in alternative method: ${errorMessage}`)
      toast({
        title: "Camera error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleIOSMethod = () => {
    try {
      addDebugInfo("iOS specific method button clicked")

      // iOS specific approach
      const input = document.createElement("input")
      input.type = "file"
      // Specify exact image types to avoid Google Drive option
      input.accept = "image/jpeg,image/png"
      input.capture = "environment" // Use the back camera

      // For iOS, we need to add it to the DOM temporarily
      input.style.position = "absolute"
      input.style.top = "-1000px"
      document.body.appendChild(input)

      addDebugInfo("Added input to DOM for iOS")

      input.onchange = (e) => {
        const target = e.target as HTMLInputElement
        if (target.files && target.files.length > 0) {
          addDebugInfo(`File selected: ${target.files[0].name}, size: ${target.files[0].size} bytes`)
          setPhotoTaken(true)
          toast({
            title: "Photo captured",
            description: `Captured photo: ${target.files[0].name}, size: ${target.files[0].size} bytes`,
          })
        } else {
          addDebugInfo("No file selected")
        }

        // Clean up
        document.body.removeChild(input)
      }

      addDebugInfo("Clicking the input element")
      input.click()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setLastError(errorMessage)
      addDebugInfo(`Error in iOS method: ${errorMessage}`)
      toast({
        title: "Camera error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Camera Troubleshooting</CardTitle>
        <CardDescription>Debug tools to help diagnose camera issues on mobile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 mb-2">
              {isMobile ? <Smartphone className="h-5 w-5" /> : <Desktop className="h-5 w-5" />}
              <span className="font-medium">Device Type:</span>
            </div>
            <div>{isMobile ? "Mobile Device" : "Desktop Device"}</div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-5 w-5" />
              <span className="font-medium">Camera:</span>
            </div>
            <div>{hasCamera === null ? "Checking..." : hasCamera ? "Available" : "Not Available"}</div>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Camera Permission:</span>
          </div>
          <div>{cameraPermission || "Unknown"}</div>
        </div>

        {lastError && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Last Error:</span>
            </div>
            <div>{lastError}</div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Try Different Camera Methods:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button onClick={handleDirectCameraAccess} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Direct Camera
            </Button>

            <Button onClick={handleAlternativeMethod} variant="outline" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Alternative Method
            </Button>

            <Button onClick={handleIOSMethod} variant="secondary" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              iOS Method
            </Button>
          </div>
        </div>

        {photoTaken && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Photo successfully taken!</span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-medium mb-2">Debug Log:</h3>
          <div className="p-3 bg-muted rounded-md h-40 overflow-auto text-xs font-mono">
            {debugInfo.map((info, index) => (
              <div key={index} className="mb-1">
                {info}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
