import { auth } from "@clerk/nextjs/server"

export async function safeAuth() {
  try {
    return await auth()
  } catch {
    return { userId: null }
  }
}
