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

    const { data: apps, error } = await supabase.from("app_catalog").select("*").order("name")

    if (error) {
      console.error("Error fetching apps:", error)
      return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 })
    }

    return NextResponse.json({ apps: apps || [] })
  } catch (error) {
    console.error("Error in admin apps API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { isAdmin } = await checkAdminAccess()

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, description, url, category, icon_url } = await request.json()

    if (!name || !description || !url) {
      return NextResponse.json({ error: "Name, description, and URL are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: app, error } = await supabase
      .from("app_catalog")
      .insert({
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        category: category || "general",
        icon_url: icon_url?.trim() || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating app:", error)
      return NextResponse.json({ error: "Failed to create app" }, { status: 500 })
    }

    return NextResponse.json({ app })
  } catch (error) {
    console.error("Error in admin create app API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
