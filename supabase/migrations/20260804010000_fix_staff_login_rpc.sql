-- La connexion staff (nom + PIN) se fait AVANT toute connexion Supabase
-- classique (l'employé n'a pas de compte auth.users). Or, les policies RLS
-- sur staff_members exigent auth.uid() = propriétaire du restaurant — donc
-- un visiteur anonyme ne pouvait JAMAIS lire staff_members, peu importe si
-- le nom/PIN était correct. La page de connexion staff était donc
-- complètement cassée depuis le début.
--
-- Fix : deux fonctions SECURITY DEFINER qui contournent RLS de façon
-- contrôlée, sans jamais exposer la colonne pin au client (contrairement à
-- une policy SELECT publique qui aurait aussi laissé n'importe qui lire
-- tous les PIN de tous les restaurants directement via l'API).

-- Étape 1 : trouver un membre du staff par son nom (recherche partielle)
CREATE OR REPLACE FUNCTION public.staff_find_by_name(p_name text)
RETURNS TABLE (id uuid, name text, role text, is_active boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, role, is_active
  FROM public.staff_members
  WHERE name ILIKE '%' || p_name || '%'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.staff_find_by_name(text) TO anon, authenticated;

-- Étape 2 : vérifier le PIN (jamais renvoyé au client, seulement comparé
-- côté serveur)
CREATE OR REPLACE FUNCTION public.staff_verify_pin(p_staff_id uuid, p_pin text)
RETURNS TABLE (id uuid, name text, role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, role
  FROM public.staff_members
  WHERE id = p_staff_id
    AND pin = p_pin
    AND is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.staff_verify_pin(uuid, text) TO anon, authenticated;
