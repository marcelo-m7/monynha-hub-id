import { safeAuth } from "@/lib/safe-auth"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

export const dynamic = "force-dynamic"

export default async function PendingPage() {
  const { userId } = await safeAuth()

  if (!userId) {
    redirect("/auth/sign-in")
  }

  const supabase = await createClient()

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  // Redirect if already approved
  if (profile?.status === "APPROVED") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monynha Me</h1>
              <p className="text-sm text-gray-600">Portal do Ecossistema</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Conta Pendente de Aprovação</CardTitle>
            <CardDescription className="text-lg">Sua conta está sendo analisada pela equipe Monynha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-yellow-800">
                Olá, <strong>{profile?.full_name}</strong>!
              </p>
              <p className="text-yellow-700 mt-2">
                Recebemos sua solicitação de acesso ao ecossistema Monynha. Nossa equipe está analisando sua conta e
                você receberá uma notificação assim que o processo for concluído.
              </p>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>O que acontece agora?</strong>
              </p>
              <ul className="text-left space-y-1">
                <li>• Nossa equipe analisará sua solicitação</li>
                <li>• Você receberá um e-mail com o resultado</li>
                <li>• Se aprovado, terá acesso a todos os aplicativos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
