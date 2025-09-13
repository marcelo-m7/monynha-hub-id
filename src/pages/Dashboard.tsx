import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, ExternalLink, Settings, Grid3X3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  url: string;
  icon_url: string;
  is_active: boolean;
  requires_subscription: boolean;
  order_index: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data: apps, isLoading: appsLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: async (): Promise<App[]> => {
      const { data, error } = await supabase
        .from('app_catalog')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      return data || [];
    },
  });

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const handleAppClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (appsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
              Monynha Me
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo ao ecossistema Monynha
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </Badge>
            
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Apps do Ecossistema</h2>
            <p className="text-muted-foreground">
              {apps?.length || 0} aplicações disponíveis
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {profile?.role === 'admin' && (
              <Button variant="outline" size="sm" asChild>
                <a href="/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </a>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Apps Grid */}
      <main className="max-w-7xl mx-auto">
        <div className={`grid gap-6 ${view === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1 max-w-3xl mx-auto'
        }`}>
          {apps?.map((app) => (
            <Card 
              key={app.id}
              className="group shadow-card border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 cursor-pointer"
              onClick={() => handleAppClick(app.url)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    {app.icon_url ? (
                      <img 
                        src={app.icon_url} 
                        alt={`${app.name} icon`}
                        className="w-8 h-8"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {app.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {app.name}
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardTitle>
                    {app.requires_subscription && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {app.description && (
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {app.description}
                  </CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {!apps?.length && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum app encontrado</h3>
            <p className="text-muted-foreground">
              Os apps do ecossistema aparecerão aqui quando estiverem disponíveis.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
