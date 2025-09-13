-- Seed the app catalog with Monynha ecosystem applications
INSERT INTO public.app_catalog (name, description, url, category, is_active) VALUES
('MonaTube', 'Plataforma de vídeos da Monynha', 'https://monatube.monynha.com', 'entertainment', true),
('MonaCloud', 'Armazenamento em nuvem seguro', 'https://monacloud.monynha.com', 'productivity', true),
('MonaPics', 'Galeria de fotos e imagens', 'https://monapics.monynha.com', 'media', true),
('MonaChat', 'Sistema de mensagens instantâneas', 'https://monachat.monynha.com', 'communication', true),
('MonaDocs', 'Editor de documentos colaborativo', 'https://monadocs.monynha.com', 'productivity', true),
('MonaMusic', 'Streaming de música', 'https://monamusic.monynha.com', 'entertainment', true);
