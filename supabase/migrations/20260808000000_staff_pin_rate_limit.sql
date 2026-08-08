-- Le PIN staff fait 4 chiffres (10 000 combinaisons possibles) et rien
-- n'empêchait de toutes les essayer en boucle via l'API publique
-- staff_verify_pin. Ajout d'un verrouillage temporaire après plusieurs
-- échecs, par compte staff visé (indépendant de l'origine des requêtes).

ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS failed_pin_attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until timestamptz;

CREATE OR REPLACE FUNCTION public.staff_verify_pin(p_staff_id uuid, p_pin text)
RETURNS TABLE (id uuid, name text, role text, restaurant_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locked_until timestamptz;
  v_attempts int;
  v_match_id uuid;
BEGIN
  SELECT locked_until, failed_pin_attempts
    INTO v_locked_until, v_attempts
  FROM public.staff_members
  WHERE staff_members.id = p_staff_id;

  -- Compte verrouillé : on ne dit même pas pourquoi, on renvoie juste rien
  IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
    RETURN;
  END IF;

  SELECT staff_members.id INTO v_match_id
  FROM public.staff_members
  WHERE staff_members.id = p_staff_id
    AND staff_members.pin = p_pin
    AND staff_members.is_active = true;

  IF v_match_id IS NOT NULL THEN
    -- Succès : on remet le compteur à zéro
    UPDATE public.staff_members
    SET failed_pin_attempts = 0, locked_until = NULL
    WHERE staff_members.id = p_staff_id;

    RETURN QUERY
      SELECT staff_members.id, staff_members.name, staff_members.role,
             staff_members.restaurant_id
      FROM public.staff_members
      WHERE staff_members.id = p_staff_id;
  ELSE
    -- Échec : on incrémente, et on verrouille 15 min après 5 essais
    UPDATE public.staff_members
    SET failed_pin_attempts = failed_pin_attempts + 1,
        locked_until = CASE
          WHEN failed_pin_attempts + 1 >= 5 THEN now() + interval '15 minutes'
          ELSE locked_until
        END
    WHERE staff_members.id = p_staff_id;
    RETURN;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.staff_verify_pin(uuid, text) TO anon, authenticated;
