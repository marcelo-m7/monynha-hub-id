-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
);

-- Create approval requests table
CREATE TABLE public.approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reason TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for approval_requests
CREATE POLICY "Users can view their own approval requests" 
ON public.approval_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all approval requests" 
ON public.approval_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
);

CREATE POLICY "Admins can update approval requests" 
ON public.approval_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
);

-- Create app catalog table
CREATE TABLE public.app_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  url TEXT NOT NULL,
  icon_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_subscription BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_catalog ENABLE ROW LEVEL SECURITY;

-- Create policies for app_catalog
CREATE POLICY "Everyone can view active apps" 
ON public.app_catalog 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage apps" 
ON public.app_catalog 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.role = 'admin'
  )
);

-- Create user apps table (for future features like pinning)
CREATE TABLE public.user_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.app_catalog(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_apps ENABLE ROW LEVEL SECURITY;

-- Create policies for user_apps
CREATE POLICY "Users can view their own apps" 
ON public.user_apps 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own apps" 
ON public.user_apps 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at
BEFORE UPDATE ON public.approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_catalog_updated_at
BEFORE UPDATE ON public.app_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.approval_requests (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample apps
INSERT INTO public.app_catalog (name, slug, description, url, icon_url, order_index) VALUES
('MonaTube', 'monatube', 'Plataforma de vídeos do ecossistema Monynha', 'https://monatube.monynha.fun', '/icons/monatube.svg', 1),
('MonaCloud', 'monacloud', 'Armazenamento em nuvem Monynha', 'https://cloud.monynha.online', '/icons/monacloud.svg', 2),
('MonaPics', 'monapics', 'Galeria de imagens Monynha', 'https://pics.monynha.fun', '/icons/monapics.svg', 3),
('MonaFlix', 'monaflix', 'Streaming de entretenimento Monynha', 'https://flix.monynha.fun', '/icons/monaflix.svg', 4),
('AssisTina', 'assistina', 'Assistente virtual inteligente', 'https://assistina.monynha.tech', '/icons/assistina.svg', 5),
('FACODI', 'facodi', 'Ferramenta de desenvolvimento', 'https://facodi.monynha.com', '/icons/facodi.svg', 6);
