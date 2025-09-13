import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { isAdmin } = await checkAdminAccess()

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = await createClient()

    // Get user statistics
    const { data: userStats } = await supabase.from("user_profiles").select("status")

    const totalUsers = userStats?.length || 0
    const pendingCount = userStats?.filter((s) => s.status === "PENDING").length || 0
    const approvedCount = userStats?.filter((s) => s.status === "APPROVED").length || 0
    const rejectedCount = userStats?.filter((s) => s.status === "REJECTED").length || 0

    // Get app statistics
    const { data: appStats } = await supabase.from("app_catalog").select("is_active")
    const totalApps = appStats?.length || 0
    const activeApps = appStats?.filter((a) => a.is_active).length || 0

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentUsers } = await supabase
      .from("user_profiles")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())

    const recentRegistrations = recentUsers?.length || 0

    return NextResponse.json({
      users: {
        total: totalUsers,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        recentRegistrations,
      },
      apps: {
        total: totalApps,
        active: activeApps,
      },
    })
  } catch (error) {
    console.error("Error in admin stats API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
