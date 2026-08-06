-- BUG CRITIQUE : la commande d'un client échouait sur mobile (mais
-- "marchait" sur PC car testée en étant connecté en tant que propriétaire).
-- Cause exacte : après avoir inséré la commande, le code relisait la ligne
-- (.select("id")) pour récupérer son identifiant — or aucune policy RLS
-- n'autorisait un client anonyme à relire une commande, donc toute la
-- requête (insertion + lecture) échouait avec une erreur 401.
--
-- Fix : le code ne relit plus après insertion (l'identifiant est généré
-- côté client). Pour le suivi de commande (l'écran "Ma commande" qui
-- vérifie le statut), on utilise cette fonction sécurisée plutôt qu'une
-- policy SELECT publique sur toute la table — qui aurait exposé les noms,
-- téléphones et notes de TOUS les clients de TOUS les restaurants à
-- n'importe qui via l'API.

CREATE OR REPLACE FUNCTION public.get_order_status(p_order_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, status
  FROM public.orders
  WHERE id = p_order_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_status(uuid) TO anon, authenticated;
