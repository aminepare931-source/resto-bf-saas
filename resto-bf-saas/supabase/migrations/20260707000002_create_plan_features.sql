-- Migration: Créer la table pour gérer les fonctionnalités par plan

-- Table des fonctionnalités
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'menu', 'reservation', 'payment', 'marketing', 'support', etc.
  icon TEXT, -- emoji ou icône
  plans TEXT[] NOT NULL DEFAULT '{basique}', -- array des plans qui ont cette fonctionnalité
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_plan_features_category ON public.plan_features(category);
CREATE INDEX IF NOT EXISTS idx_plan_features_plans ON public.plan_features USING GIN(plans);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_plan_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_plan_features_updated_at ON public.plan_features;
CREATE TRIGGER update_plan_features_updated_at
  BEFORE UPDATE ON public.plan_features
  FOR EACH ROW EXECUTE FUNCTION public.update_plan_features_updated_at();

-- RLS policies
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- Seul le super_admin peut modifier
CREATE POLICY "Super admin can manage plan features" ON public.plan_features
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Tout le monde peut lire (pour afficher les fonctionnalités disponibles)
CREATE POLICY "Anyone can read plan features" ON public.plan_features
  FOR SELECT TO anon, authenticated
  USING (true);

-- Insérer les fonctionnalités par défaut
INSERT INTO public.plan_features (name, description, category, icon, plans) VALUES
  ('Menu digital', 'Menu en ligne avec photos et prix', 'menu', '📱', ARRAY['basique', 'standard', 'premium']),
  ('Jusqu''à 10 plats', 'Limite de 10 plats dans le menu', 'menu', '🍽️', ARRAY['basique']),
  ('Jusqu''à 30 plats', 'Limite de 30 plats dans le menu', 'menu', '🍽️', ARRAY['standard', 'premium']),
  ('Menu illimité', 'Nombre de plats illimité', 'menu', '🍽️', ARRAY['premium']),
  
  ('Commande WhatsApp', 'Bouton de commande directe', 'order', '💬', ARRAY['basique', 'standard', 'premium']),
  ('QR Code restaurant', 'QR code pour accéder au menu', 'qr', '📲', ARRAY['basique', 'standard', 'premium']),
  
  ('Réservations basiques', 'Formulaire de réservation simple', 'reservation', '📅', ARRAY['basique']),
  ('Réservations avancées', 'Réservations avec choix de table et occasion', 'reservation', '📅', ARRAY['standard', 'premium']),
  
  ('1 Template basique', 'Template Classique uniquement', 'template', '🎨', ARRAY['basique']),
  ('4 Templates Standard', 'Soleil, Savane, Marché, Moderne', 'template', '🎨', ARRAY['standard']),
  ('4 Templates Premium animés', 'Templates avec animations avancées', 'template', '✨', ARRAY['premium']),
  
  ('Statistiques essentielles', 'Vues et commandes de base', 'stats', '📊', ARRAY['basique']),
  ('Statistiques basiques', 'Statistiques détaillées', 'stats', '📊', ARRAY['standard']),
  ('Statistiques avancées', 'Analytics complets avec graphiques', 'stats', '📈', ARRAY['premium']),
  
  ('Galerie photos', 'Jusqu''à 10 photos', 'gallery', '🖼️', ARRAY['standard', 'premium']),
  ('Galerie illimitée', 'Photos illimitées', 'gallery', '🖼️', ARRAY['premium']),
  
  ('Avis clients', 'Système d''avis et témoignages', 'reviews', '⭐', ARRAY['standard', 'premium']),
  
  ('Facturation PDF basique', 'Factures simples', 'billing', '🧾', ARRAY['standard']),
  ('Facturation PDF + logo', 'Factures personnalisées avec logo', 'billing', '🧾', ARRAY['premium']),
  
  ('Gestion employés', 'Ajout de staff avec rôles', 'staff', '👥', ARRAY['premium']),
  ('Promotions', 'Codes promo et réductions', 'marketing', '🏷️', ARRAY['premium']),
  ('Rapports mensuels', 'Rapports PDF automatiques', 'reports', '📄', ARRAY['premium']),
  ('Support prioritaire', 'Support WhatsApp dédié', 'support', '🎧', ARRAY['premium']);

-- Grant permissions
GRANT ALL ON public.plan_features TO postgres;
GRANT ALL ON public.plan_features TO service_role;
GRANT SELECT ON public.plan_features TO anon, authenticated;