-- Plusieurs policies d'insertion publique n'avaient AUCUNE validation
-- (WITH CHECK true) : n'importe qui pouvait insérer une réservation ou un
-- avis pour un restaurant qui n'existe même pas, ou un code de paiement
-- "confirmé" pour la commande de quelqu'un d'autre. Resserré ici.

-- Réservations : le restaurant visé doit vraiment exister
DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
CREATE POLICY "Anyone can create reservation" ON public.reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = reservations.restaurant_id)
  );

-- Avis clients : idem
DROP POLICY IF EXISTS "Anyone can submit review" ON public.reviews;
CREATE POLICY "Anyone can submit review" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = reviews.restaurant_id)
  );

-- Codes de paiement : ne peut être créé que pour une commande qui existe
-- vraiment (empêche de fabriquer un faux code "confirmé" au hasard)
DROP POLICY IF EXISTS "Public creates payment code for own order" ON public.payment_codes;
CREATE POLICY "Public creates payment code for own order" ON public.payment_codes
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payment_codes.order_id)
    AND status = 'pending'
  );

-- Commandes : fusion des deux policies d'insertion publique redondantes
-- en une seule qui garde à la fois la vérification d'existence ET les
-- garde-fous de forme (statut initial, source valide, articles cohérents)
DROP POLICY IF EXISTS "Public creates orders" ON public.orders;
DROP POLICY IF EXISTS "Anon can create orders" ON public.orders;
CREATE POLICY "Public creates orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = orders.restaurant_id)
    AND status = 'new'
    AND source IN ('qr', 'whatsapp')
    AND jsonb_typeof(items) = 'array'
    AND jsonb_array_length(items) BETWEEN 1 AND 50
  );
