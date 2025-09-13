import { redirect } from "next/navigation"
import { checkAdminAccess } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserButton } from "@clerk/nextjs"
import { Users, Clock, CheckCircle, XCircle } from "lucide-react"
import { ApprovalActions } from "@/components/admin/approval-actions"

export default async function AdminPage() {
  const { isAdmin } = await checkAdminAccess()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const supabase = await createClient()

  // Get pending approval requests with user profiles
  const { data: pendingRequests } = await supabase
    .from("approval_requests")
    .select(`
      *,
      user_profile:user_profiles(*)
    `)
    .eq("status", "PENDING")
    .order("created_at", { ascending: true })

  // Get statistics
  const { data: stats } = await supabase.from("user_profiles").select("status")

  const totalUsers = stats?.length || 0
  const pendingCount = stats?.filter((s) => s.status === "PENDING").length || 0
  const approvedCount = stats?.filter((s) => s.status === "APPROVED").length || 0
  const rejectedCount = stats?.filter((s) => s.status === "REJECTED").length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Gerenciamento de usuários e aprovações</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
              <CardDescription>Usuários aguardando aprovação para acessar o ecossistema Monynha</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests && pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium">{request.user_profile.full_name}</h3>
                            <p className="text-sm text-gray-600">{request.user_profile.email}</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Registrado em: {new Date(request.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <ApprovalActions requestId={request.id} userId={request.user_id} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma solicitação pendente no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
