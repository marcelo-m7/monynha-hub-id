import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Monynha Me - Portal de Acesso",
  description: "Portal de autenticação para o ecossistema Monynha",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const content = (
    <html lang="pt-BR">
      <body>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )

  // During local builds the Clerk publishable key may be absent. In that case we
  // skip the provider so the build can succeed, while still allowing deployments
  // with the key set to wrap the app in `ClerkProvider`.
  if (!publishableKey) {
    return content
  }

  return (
    <ClerkProvider publishableKey={publishableKey} localization={ptBR}>
      {content}
    </ClerkProvider>
  )
}
