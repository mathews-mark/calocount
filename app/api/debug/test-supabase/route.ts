import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  const diagnostics = {
    success: false,
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
    },
    connection: {
      status: "Not tested",
      error: null,
    },
    database: {
      status: "Not tested",
      error: null,
      tables: [],
    },
  }

  try {
    // Check if we have the required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      diagnostics.connection.status = "Failed - Missing environment variables"
      return NextResponse.json(diagnostics)
    }

    // Try to initialize the Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    diagnostics.connection.status = "Initialized client"

    // Test a simple query to verify connection
    const { data, error } = await supabase.from("food_entries").select("count(*)").limit(1)

    if (error) {
      diagnostics.database.status = "Error querying database"
      diagnostics.database.error = error.message
    } else {
      diagnostics.database.status = "Connected successfully"
      diagnostics.success = true

      // Get list of tables
      const { data: tableData, error: tableError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")

      if (!tableError && tableData) {
        diagnostics.database.tables = tableData.map((t) => t.table_name)
      }
    }
  } catch (error) {
    diagnostics.connection.status = "Error initializing client"
    diagnostics.connection.error = error instanceof Error ? error.message : "Unknown error"
  }

  return NextResponse.json(diagnostics)
}
