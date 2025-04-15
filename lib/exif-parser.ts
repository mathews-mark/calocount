import exifr from "exifr"
import { format } from "date-fns"

export async function extractExifDateTime(file: File): Promise<{ date: string; time: string } | null> {
  try {
    // Parse EXIF data from the image
    const exifData = await exifr.parse(file, ["DateTimeOriginal", "CreateDate", "ModifyDate"])

    // Try to get the date the photo was taken
    const dateTime = exifData?.DateTimeOriginal || exifData?.CreateDate || exifData?.ModifyDate

    // If no date found in EXIF, use current date/time
    if (!dateTime) {
      console.log("No EXIF date found, using current date/time")
      return null
    }

    // Format the date and time
    const date = format(new Date(dateTime), "yyyy-MM-dd")
    const time = format(new Date(dateTime), "HH:mm")

    return { date, time }
  } catch (error) {
    console.error("Error extracting EXIF data:", error)
    return null
  }
}

export function getCurrentDateTime(): { date: string; time: string } {
  const now = new Date()
  return {
    date: format(now, "yyyy-MM-dd"),
    time: format(now, "HH:mm"),
  }
}
