import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Check, X, Clock, Users, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApprovalRequest {
  id: string;
  user_id: string;
  status: string;
  reason: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  user_profiles: {
    email: string;
    role: string;
  } | null;
}

const Admin = () => {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async (): Promise<ApprovalRequest[]> => {
      // First get approval requests
      const { data: requests, error: requestsError } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true });

      if (requestsError) throw requestsError;
      if (!requests) return [];

      // Then get user profiles for each request
      const requestsWithProfiles = await Promise.all(
        requests.map(async (request) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email, role')
            .eq('user_id', request.user_id)
            .single();

          return {
            ...request,
            user_profiles: profile || { email: 'Unknown', role: 'user' }
          };
        })
      );

      return requestsWithProfiles;
    },
    enabled: profile?.role === 'admin',
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ userId, approve, reason }: { userId: string; approve: boolean; reason?: string }) => {
      const newStatus = approve ? 'APPROVED' : 'REJECTED';
      
      // Update user profile status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Update approval request
      const { error: requestError } = await supabase
        .from('approval_requests')
        .update({
          status: newStatus,
          decided_by: user?.id,
          decided_at: new Date().toISOString(),
          reason: reason || null,
        })
        .eq('user_id', userId)
        .eq('status', 'PENDING');

      if (requestError) throw requestError;
    },
    onSuccess: (_, { approve }) => {
      toast({
        title: approve ? 'Usuário aprovado!' : 'Usuário rejeitado',
        description: approve 
          ? 'O usuário pode agora acessar o dashboard.'
          : 'O usuário foi notificado da rejeição.',
      });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao processar solicitação. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Approval error:', error);
    },
  });

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Redirect if not admin
  if (profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <a href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </a>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie aprovações de usuários
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingRequests?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserX className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Rejeitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Pending Approvals */}
      <main className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Solicitações Pendentes</h2>
          <p className="text-muted-foreground">
            {pendingRequests?.length || 0} usuários aguardando aprovação
          </p>
        </div>

        <div className="space-y-4">
          {pendingRequests?.map((request) => (
            <Card key={request.id} className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {request.user_profiles?.email ? getInitials(request.user_profiles.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold">{request.user_profiles?.email || 'Email não encontrado'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Solicitado em {formatDate(request.created_at)}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => approvalMutation.mutate({ 
                        userId: request.user_id, 
                        approve: false 
                      })}
                      disabled={approvalMutation.isPending}
                      className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => approvalMutation.mutate({ 
                        userId: request.user_id, 
                        approve: true 
                      })}
                      disabled={approvalMutation.isPending}
                      className="border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!pendingRequests?.length && (
            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação pendente</h3>
                <p className="text-muted-foreground">
                  Todas as solicitações de cadastro foram processadas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
