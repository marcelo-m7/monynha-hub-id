import { safeAuth } from "@/lib/safe-auth"
import { createClient } from "@/lib/supabase/server"

export async function checkAdminAccess() {
  const { userId } = await safeAuth()

  if (!userId) {
    return { isAdmin: false, user: null }
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  return {
    isAdmin: profile?.role === "admin",
    user: profile,
  }
}
