-- Migration: Système détaillé de fonctionnalités par plan

-- Supprimer l'ancienne table si elle existe
DROP TABLE IF EXISTS public.plan_features;

-- Créer la nouvelle table détaillée
CREATE TABLE public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  plans TEXT[] NOT NULL DEFAULT '{basique}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_plan_features_category ON public.plan_features(category);
CREATE INDEX idx_plan_features_plans ON public.plan_features USING GIN(plans);

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

-- RLS
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage plan features" ON public.plan_features
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can read plan features" ON public.plan_features
  FOR SELECT TO anon, authenticated
  USING (true);

-- Insérer toutes les fonctionnalités détaillées
INSERT INTO public.plan_features (name, description, category, icon, plans) VALUES
  -- MENU
  ('Menu digital', 'Menu en ligne avec photos et prix', 'menu', '📱', ARRAY['basique', 'standard', 'premium']),
  ('Jusqu''à 10 plats', 'Limite de 10 plats dans le menu', 'menu', '🍽️', ARRAY['basique']),
  ('Jusqu''à 30 plats', 'Limite de 30 plats dans le menu', 'menu', '🍽️', ARRAY['standard']),
  ('Menu illimité', 'Nombre de plats illimité', 'menu', '🍽️', ARRAY['premium']),
  
  -- COMMANDES
  ('Commande WhatsApp', 'Bouton de commande directe', 'order', '💬', ARRAY['basique', 'standard', 'premium']),
  ('Panier de commande', 'Système de panier multi-plats', 'order', '🛒', ARRAY['basique', 'standard', 'premium']),
  
  -- QR CODE
  ('QR Code restaurant', 'QR code pour accéder au menu', 'qr', '📲', ARRAY['basique', 'standard', 'premium']),
  
  -- RÉSERVATIONS
  ('Réservations basiques', 'Formulaire de réservation simple', 'reservation', '📅', ARRAY['basique']),
  ('Réservations avancées', 'Réservations avec choix de table et occasion', 'reservation', '📅', ARRAY['standard', 'premium']),
  ('Gestion des tables', 'Plan de salle et gestion des tables', 'reservation', '🪑', ARRAY['premium']),
  
  -- TEMPLATES
  ('1 Template basique', 'Template Classique uniquement', 'template', '🎨', ARRAY['basique']),
  ('4 Templates Standard', 'Soleil, Savane, Marché, Moderne', 'template', '🎨', ARRAY['standard']),
  ('4 Templates Premium animés', 'Templates avec animations avancées', 'template', '✨', ARRAY['premium']),
  
  -- STATISTIQUES
  ('Statistiques essentielles', 'Vues et commandes de base', 'stats', '📊', ARRAY['basique']),
  ('Statistiques basiques', 'Statistiques détaillées', 'stats', '📊', ARRAY['standard']),
  ('Statistiques avancées', 'Analytics complets avec graphiques', 'stats', '📈', ARRAY['premium']),
  
  -- GALERIE
  ('Galerie photos', 'Jusqu''à 10 photos', 'gallery', '🖼️', ARRAY['standard']),
  ('Galerie illimitée', 'Photos illimitées', 'gallery', '🖼️', ARRAY['premium']),
  
  -- AVIS
  ('Avis clients', 'Système d''avis et témoignages', 'reviews', '⭐', ARRAY['standard', 'premium']),
  
  -- FACTURATION
  ('Facturation PDF basique', 'Factures simples', 'billing', '🧾', ARRAY['standard']),
  ('Facturation PDF + logo', 'Factures personnalisées avec logo', 'billing', '🧾', ARRAY['premium']),
  
  -- STAFF
  ('Gestion employés', 'Ajout de staff avec rôles', 'staff', '👥', ARRAY['premium']),
  
  -- MARKETING
  ('Promotions', 'Codes promo et réductions', 'marketing', '🏷️', ARRAY['premium']),
  ('Rapports mensuels', 'Rapports PDF automatiques', 'reports', '📄', ARRAY['premium']),
  
  -- SUPPORT
  ('Support prioritaire', 'Support WhatsApp dédié', 'support', '🎧', ARRAY['premium']),
  
  -- PERSONNALISATION
  ('Logo personnalisé', 'Upload du logo restaurant', 'custom', '🖼️', ARRAY['standard', 'premium']),
  ('Couleurs personnalisées', 'Personnalisation des couleurs', 'custom', '🎨', ARRAY['standard', 'premium']),
  ('Police personnalisée', 'Choix de la police d''écriture', 'custom', '✏️', ARRAY['premium']),
  
  -- DOMAINE
  ('Domaine personnalisé', 'Nom de domaine propre', 'domain', '🌐', ARRAY['premium']),
  
  -- AVANCÉ
  ('Multi-utilisateur', 'Plusieurs comptes staff', 'advanced', '👥', ARRAY['premium']),
  ('API access', 'Accès API pour intégrations', 'advanced', '🔌', ARRAY['premium']),
  ('White label', 'Suppression du branding Resto BF', 'advanced', '🏷️', ARRAY['premium']);

-- Grant permissions
GRANT ALL ON public.plan_features TO postgres;
GRANT ALL ON public.plan_features TO service_role;
GRANT SELECT ON public.plan_features TO anon, authenticated;