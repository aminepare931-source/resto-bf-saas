-- Migration: Créer la table plan_features pour contrôler les fonctionnalités par abonnement

CREATE TABLE IF NOT EXISTS public.plan_features (
  plan text PRIMARY KEY,
  label text NOT NULL,
  can_upload_logo boolean DEFAULT false,
  can_reserve boolean DEFAULT false,
  can_customize_colors boolean DEFAULT false,
  can_customize_font boolean DEFAULT false,
  max_gallery_images integer DEFAULT 0,
  has_reviews boolean DEFAULT false,
  has_whatsapp boolean DEFAULT false,
  has_qr_code boolean DEFAULT false,
  has_analytics boolean DEFAULT false,
  has_multi_user boolean DEFAULT false,
  has_custom_domain boolean DEFAULT false,
  has_priority_support boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insérer les configurations par défaut pour chaque plan
INSERT INTO public.plan_features (plan, label, can_upload_logo, can_reserve, can_customize_colors, can_customize_font, max_gallery_images, has_reviews, has_whatsapp, has_qr_code, has_analytics, has_multi_user, has_custom_domain, has_priority_support)
VALUES
  ('gratuit', 'Gratuit', false, false, false, false, 3, true, true, false, false, false, false, false),
  ('standard', 'Standard', true, true, true, false, 10, true, true, false, false, false, false, false),
  ('premium', 'Premium', true, true, true, true, 30, true, true, true, true, true, false, false)
ON CONFLICT (plan) DO NOTHING;

-- Activer RLS
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture à tout le monde (anon et authenticated)
CREATE POLICY "Lecture publique des plan_features"
  ON public.plan_features
  FOR SELECT
  USING (true);

-- Permettre la modification uniquement aux super admins
CREATE POLICY "Modification par super admin"
  ON public.plan_features
  FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = auth.uid()::text 
      AND plan = 'premium'
    )
  );

GRANT SELECT ON public.plan_features TO anon, authenticated;