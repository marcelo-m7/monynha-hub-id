import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"])

export default clerkMiddleware(
  (auth, req) => {
    if (isProtectedRoute(req)) {
      // Return the auth.protect() call so unauthenticated requests are
      // properly redirected by Clerk instead of falling through and
      // triggering a client-side redirect loop.
      return auth.protect()
    }
  },
  {
    signInUrl: "/auth/sign-in",
    signUpUrl: "/auth/sign-up",
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
