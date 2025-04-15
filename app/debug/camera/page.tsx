import { CameraDebug } from "@/components/camera-debug"

export default function CameraDebugPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Camera Debug</h1>
      <p className="text-muted-foreground">Use this page to troubleshoot camera issues on your device.</p>

      <CameraDebug />
    </div>
  )
}
