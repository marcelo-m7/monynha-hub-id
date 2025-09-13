import { type NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAccess()

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { requestId, userId, action, notes } = await request.json()

    if (!requestId || !userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Update approval request
    const { error: requestError } = await supabase
      .from("approval_requests")
      .update({
        status: action === "approve" ? "APPROVED" : "REJECTED",
        admin_notes: notes,
        approved_at: action === "approve" ? new Date().toISOString() : null,
      })
      .eq("id", requestId)

    if (requestError) {
      console.error("Error updating approval request:", requestError)
      return NextResponse.json({ error: "Failed to update approval request" }, { status: 500 })
    }

    // Update user profile status
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        status: action === "approve" ? "APPROVED" : "REJECTED",
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Error updating user profile:", profileError)
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
    }

    // If approved, grant access to all apps
    if (action === "approve") {
      const { data: apps } = await supabase.from("app_catalog").select("id").eq("is_active", true)

      if (apps && apps.length > 0) {
        const userApps = apps.map((app) => ({
          user_id: userId,
          app_id: app.id,
        }))

        const { error: appsError } = await supabase.from("user_apps").insert(userApps)

        if (appsError) {
          console.error("Error granting app access:", appsError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in approve-user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
