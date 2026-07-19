-- Ajoute la possibilité pour un restaurant d'indiquer s'il propose la livraison.
-- Par défaut à false : on ne doit jamais proposer la livraison à un client tant
-- que le restaurant ne l'a pas explicitement activée dans ses paramètres.

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS offers_delivery boolean NOT NULL DEFAULT false;

DROP VIEW IF EXISTS public.public_restaurants;

CREATE OR REPLACE VIEW public.public_restaurants
WITH (security_invoker = true) AS
SELECT
  id, name, slug, city, cuisine, description, address, hours,
  phone, whatsapp, email, plan, logo_url, template, hero_title, hero_subtitle,
  about_text, primary_color, font_family, sections, social_links,
  subscription_status, offers_delivery
FROM public.restaurants;

GRANT SELECT ON public.public_restaurants TO anon, authenticated;
