-- Migration: Ajouter subscription_status à la vue public_restaurants

-- Supprimer et recréer la vue avec subscription_status
DROP VIEW IF EXISTS public.public_restaurants;

CREATE OR REPLACE VIEW public.public_restaurants
WITH (security_invoker = true) AS
SELECT
  id, name, slug, city, cuisine, description, address, hours,
  phone, whatsapp, template, logo_url, hero_title, hero_subtitle,
  about_text, primary_color, font_family, sections, social_links,
  subscription_status
FROM public.restaurants;

GRANT SELECT ON public.public_restaurants TO anon, authenticated;