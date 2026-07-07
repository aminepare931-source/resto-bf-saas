-- Fix: Réinitialiser la fonction has_role et ses permissions
-- À exécuter dans Supabase → SQL Editor

-- 1. Recréer la fonction has_role avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 2. Révoquer toutes les permissions existantes
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- 3. Redonner les permissions aux bons utilisateurs
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 4. Vérifier que ça fonctionne (test avec ton user_id)
-- Remplace 'TON_USER_ID' par ton vrai user_id
-- SELECT public.has_role('TON_USER_ID', 'super_admin');

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'has_role function fixed and permissions granted to authenticated users';
END $$;
