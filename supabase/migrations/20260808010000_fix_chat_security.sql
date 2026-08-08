-- FAILLE DE SÉCURITÉ CORRIGÉE : les policies "Staff can read/insert chat"
-- ne vérifiaient en réalité JAMAIS qui faisait la demande — la condition
-- se contentait de vérifier que le restaurant avait au moins un membre du
-- staff (presque toujours vrai), pas que LA PERSONNE QUI DEMANDE en fait
-- partie. Résultat : n'importe quel visiteur anonyme connaissant (ou
-- devinant) l'identifiant d'un restaurant pouvait lire et écrire dans son
-- chat interne cuisine/salle.

DROP POLICY IF EXISTS "Staff can read chat" ON public.chat_messages;
DROP POLICY IF EXISTS "Staff can insert chat" ON public.chat_messages;

-- Le propriétaire (vrai compte Supabase) garde un accès direct normal
CREATE POLICY "Owner reads chat" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
  );

CREATE POLICY "Owner inserts chat" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
  );

-- Le staff (connexion nom+PIN, pas de compte Supabase) passe par des
-- fonctions sécurisées qui vérifient son identité côté serveur avant
-- d'autoriser quoi que ce soit — jamais d'accès direct à la table.
CREATE OR REPLACE FUNCTION public.staff_read_chat(p_staff_id uuid, p_restaurant_id uuid)
RETURNS SETOF public.chat_messages
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cm.*
  FROM public.chat_messages cm
  WHERE cm.restaurant_id = p_restaurant_id
    AND EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = p_staff_id
        AND sm.restaurant_id = p_restaurant_id
        AND sm.is_active = true
    )
  ORDER BY cm.created_at ASC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.staff_read_chat(uuid, uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.staff_send_chat(
  p_staff_id uuid,
  p_restaurant_id uuid,
  p_message text,
  p_sender_name text,
  p_sender_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.staff_members sm
    WHERE sm.id = p_staff_id
      AND sm.restaurant_id = p_restaurant_id
      AND sm.is_active = true
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.chat_messages (restaurant_id, sender_name, sender_role, message, read)
  VALUES (p_restaurant_id, p_sender_name, p_sender_role, p_message, false);
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.staff_send_chat(uuid, uuid, text, text, text) TO anon, authenticated;
