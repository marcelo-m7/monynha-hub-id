import { safeAuth } from "@/lib/safe-auth"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { userId } = await safeAuth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Check if user is approved
    const { data: profile } = await supabase.from("user_profiles").select("status").eq("id", userId).single()

    if (profile?.status !== "APPROVED") {
      return NextResponse.json({ apps: [] })
    }

    // Get user's apps
    const { data: userApps, error } = await supabase
      .from("user_apps")
      .select(`
        *,
        app:app_catalog(*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user apps:", error)
      return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 })
    }

    return NextResponse.json({ apps: userApps || [] })
  } catch (error) {
    console.error("Error in user apps API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
