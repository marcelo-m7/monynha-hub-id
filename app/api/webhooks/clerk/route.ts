import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local")
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses[0]?.email_address
    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || email

    try {
      const supabase = await createClient()

      // Create user profile in Supabase
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id,
        email,
        full_name: fullName,
        status: "PENDING",
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        return new Response("Error creating user profile", { status: 500 })
      }

      // Create approval request
      const { error: approvalError } = await supabase.from("approval_requests").insert({
        user_id: id,
        status: "PENDING",
      })

      if (approvalError) {
        console.error("Error creating approval request:", approvalError)
        return new Response("Error creating approval request", { status: 500 })
      }

      console.log(`User ${email} registered and pending approval`)
    } catch (error) {
      console.error("Error handling user creation:", error)
      return new Response("Error handling user creation", { status: 500 })
    }
  }

  return new Response("", { status: 200 })
}
