import { safeAuth } from "@/lib/safe-auth"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { Clock, CheckCircle, XCircle, ExternalLink, Settings } from "lucide-react"
import Link from "next/link"

interface UserApp {
  id: string
  app: {
    name: string
    category: string
    description: string
    url: string
  }
}

export default async function DashboardPage() {
  const { userId } = await safeAuth()

  if (!userId) {
    redirect("/auth/sign-in")
  }

  const supabase = await createClient()

  // Get user profile and approval status
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  const { data: approvalRequest } = await supabase.from("approval_requests").select("*").eq("user_id", userId).single()

  // Get user's apps if approved
  const { data: userApps } =
    profile?.status === "APPROVED"
      ? await supabase
          .from("user_apps")
          .select(`
          *,
          app:app_catalog(*)
        `)
          .eq("user_id", userId)
      : { data: null }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const appsByCategory =
    userApps?.reduce<Record<string, UserApp[]>>((acc, userApp) => {
      const category = userApp.app.category || "general"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(userApp)
      return acc
    }, {}) || {}

  const categoryNames: { [key: string]: string } = {
    entertainment: "Entretenimento",
    productivity: "Produtividade",
    communication: "Comunicação",
    media: "Mídia",
    general: "Geral",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Monynha Me</h1>
                <p className="text-sm text-gray-600">Portal do Ecossistema</p>
              </div>
              {profile?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo, {profile?.full_name}!</h2>
            <p className="text-blue-100">
              {profile?.status === "APPROVED"
                ? "Acesse todos os aplicativos do ecossistema Monynha"
                : "Sua conta está sendo processada pela nossa equipe"}
            </p>
          </div>

          {/* User Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Status da Conta
                {getStatusIcon(profile?.status || "PENDING")}
              </CardTitle>
              <CardDescription>Informações sobre o status da sua conta no ecossistema Monynha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(profile?.status || "PENDING")}>
                  {profile?.status === "PENDING" && "Pendente de Aprovação"}
                  {profile?.status === "APPROVED" && "Aprovada"}
                  {profile?.status === "REJECTED" && "Rejeitada"}
                </Badge>
                <div>
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-gray-600">{profile?.email}</p>
                </div>
              </div>

              {profile?.status === "PENDING" && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Sua conta está sendo analisada pela equipe Monynha. Você receberá uma notificação quando for
                    aprovada.
                  </p>
                </div>
              )}

              {profile?.status === "REJECTED" && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    Sua conta foi rejeitada.
                    {approvalRequest?.admin_notes && (
                      <>
                        <br />
                        <strong>Motivo:</strong> {approvalRequest.admin_notes}
                      </>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apps Grid - Only show if approved */}
          {profile?.status === "APPROVED" && userApps && userApps.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Seus Aplicativos</h2>
                <Badge variant="outline">
                  {userApps.length} aplicativo{userApps.length !== 1 ? "s" : ""}{" "}
                  {userApps.length !== 1 ? "disponíveis" : "disponível"}
                </Badge>
              </div>

              {Object.entries(appsByCategory).map(([category, apps]: [string, UserApp[]]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{categoryNames[category] || category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((userApp) => (
                      <Card key={userApp.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              {userApp.app.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold">{userApp.app.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {categoryNames[userApp.app.category] || userApp.app.category}
                              </Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="mb-4 min-h-[2.5rem]">{userApp.app.description}</CardDescription>
                          <Button asChild className="w-full">
                            <a href={userApp.app.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Acessar
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No apps message for approved users */}
          {profile?.status === "APPROVED" && (!userApps || userApps.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum aplicativo disponível</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Nenhum aplicativo foi atribuído à sua conta ainda. Entre em contato com a equipe Monynha para mais
                  informações sobre os aplicativos disponíveis.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats for approved users */}
          {profile?.status === "APPROVED" && userApps && userApps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Uso</CardTitle>
                <CardDescription>Resumo da sua atividade no ecossistema Monynha</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userApps.length}</div>
                    <div className="text-sm text-blue-800">Aplicativos Disponíveis</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="text-sm text-green-800">Membro desde</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Object.keys(appsByCategory).length}</div>
                    <div className="text-sm text-purple-800">Categorias</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
