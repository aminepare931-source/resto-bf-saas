
-- 1) Public-facing view (only safe columns)
CREATE OR REPLACE VIEW public.public_restaurants
WITH (security_invoker = true) AS
SELECT
  id, name, slug, city, cuisine, description, address, hours,
  phone, whatsapp, template, logo_url, hero_title, hero_subtitle,
  about_text, primary_color, font_family, sections, social_links
FROM public.restaurants;

GRANT SELECT ON public.public_restaurants TO anon, authenticated;

-- 2) Restrict restaurants table SELECT to owner + super_admin
DROP POLICY IF EXISTS "Public can read restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Anyone can read restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "anyone_select_restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public read restaurants" ON public.restaurants;

-- Make sure owner-select policy exists (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='restaurants' AND policyname='Owner reads own restaurant'
  ) THEN
    CREATE POLICY "Owner reads own restaurant" ON public.restaurants
      FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='restaurants' AND policyname='Super admin reads restaurants'
  ) THEN
    CREATE POLICY "Super admin reads restaurants" ON public.restaurants
      FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
  END IF;
END $$;

-- 3) Lock SECURITY DEFINER functions: revoke broad EXECUTE
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.super_admin_exists() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_restaurant_user() FROM PUBLIC, anon, authenticated;
-- claim_super_admin must stay callable by authenticated to bootstrap the first super_admin
REVOKE EXECUTE ON FUNCTION public.claim_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_exists() TO authenticated;
-- has_role is used inside policies (security definer), policies don't need EXECUTE grant
