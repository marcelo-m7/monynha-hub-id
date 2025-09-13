import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { isAdmin } = await checkAdminAccess()

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from("user_profiles")
      .select(`
        *,
        approval_request:approval_requests(*)
      `)
      .order("created_at", { ascending: false })

    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      query = query.eq("status", status)
    }

    const { data: users, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase.from("user_profiles").select("*", { count: "exact", head: true })

    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      countQuery = countQuery.eq("status", status)
    }

    const { count } = await countQuery

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in admin users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
