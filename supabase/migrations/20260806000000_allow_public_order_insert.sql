-- BUG CRITIQUE : aucune policy RLS n'autorisait un client anonyme (non
-- connecté) à créer une commande sur la table orders — seule une policy
-- "Owner inserts orders" existait, réservée au propriétaire authentifié.
-- Conséquence : AUCUN vrai client n'a jamais pu passer commande depuis le
-- site public (ça ne fonctionnait que pour le propriétaire testant depuis
-- son propre compte déjà connecté, d'où l'illusion que "ça marche sur PC").

CREATE POLICY "Public creates orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id)
  );
