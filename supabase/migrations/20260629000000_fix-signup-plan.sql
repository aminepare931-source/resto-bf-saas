-- Fix: use plan from auth metadata instead of hardcoded 'trial'
-- This allows users who selected a paid plan on the pricing page
-- to get that plan assigned at signup time.

CREATE OR REPLACE FUNCTION public.handle_new_restaurant_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_name text := meta->>'restaurant_name';
  v_slug text;
  v_plan text := COALESCE(NULLIF(meta->>'plan',''), 'trial');
BEGIN
  IF v_name IS NULL OR v_name = '' THEN
    RETURN NEW;
  END IF;
  v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug) || '-' || substr(md5(random()::text), 1, 4);

  INSERT INTO public.restaurants (
    user_id, name, slug, city, cuisine, owner_name, phone, whatsapp, email,
    plan, subscription_status, trial_ends_at
  ) VALUES (
    NEW.id, v_name, v_slug,
    COALESCE(meta->>'city', ''),
    meta->>'cuisine',
    COALESCE(meta->>'owner_name', ''),
    COALESCE(meta->>'phone', ''),
    regexp_replace(COALESCE(meta->>'phone',''), '\s|\+', '', 'g'),
    NEW.email,
    v_plan,
    CASE WHEN v_plan = 'trial' THEN 'trial' ELSE 'active' END,
    CASE WHEN v_plan = 'trial' THEN now() + interval '14 days' ELSE NULL END
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Ensure trigger points to the updated function (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_restaurant ON auth.users;
CREATE TRIGGER on_auth_user_created_restaurant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_restaurant_user();
