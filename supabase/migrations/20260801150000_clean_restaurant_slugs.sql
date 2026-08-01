-- Fix: n'ajouter un suffixe aléatoire au slug QUE s'il y a une vraie collision
-- (un autre restaurant a déjà exactement ce nom). Avant, un suffixe du type
-- "-5a17" était ajouté systématiquement à TOUS les nouveaux restaurants,
-- rendant les liens publics inutilement moches (ex: petit-paris-5a17 au lieu
-- de simplement petit-paris).

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
  v_slug := trim(both '-' from v_slug);

  IF v_slug = '' THEN
    v_slug := 'restaurant';
  END IF;

  -- Suffixe aléatoire uniquement en cas de collision réelle avec un slug existant
  IF EXISTS (SELECT 1 FROM public.restaurants WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
  END IF;

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
