import { createClient } from "@supabase/supabase-js"
import type { Entry } from "@/types"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getFoodEntries(): Promise<Entry[]> {
  const { data, error } = await supabase.from("entries").select("*").order("date", { ascending: false })

  if (error) {
    console.error("Error fetching food entries:", error)
    return []
  }

  return data || []
}
