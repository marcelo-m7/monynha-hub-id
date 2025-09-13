import { safeAuth } from "@/lib/safe-auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { userId } = await safeAuth()

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Monynha Me</h1>
          <p className="text-lg text-gray-600">Portal de Acesso ao Ecossistema Monynha</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>Acesse sua conta para utilizar todos os serviços do ecossistema Monynha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/sign-in">Entrar</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/auth/sign-up">Criar Conta</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Após o registro, sua conta será analisada pela equipe Monynha</p>
        </div>
      </div>
    </div>
  )
}
