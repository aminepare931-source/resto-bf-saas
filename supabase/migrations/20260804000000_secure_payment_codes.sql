-- La table payment_codes n'avait AUCUNE protection (pas de RLS, pas de
-- policies) et pas de colonne restaurant_id — n'importe quel utilisateur
-- authentifié pouvait potentiellement lire/modifier les codes de paiement
-- de TOUS les restaurants via l'API Supabase. Corrigé ici.

-- 1. Ajouter une colonne restaurant_id (dénormalisée depuis orders, pour
--    des policies RLS simples et rapides sans jointure)
ALTER TABLE public.payment_codes
  ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id);

-- Remplir restaurant_id pour les lignes existantes à partir de orders
UPDATE public.payment_codes pc
SET restaurant_id = o.restaurant_id
FROM public.orders o
WHERE pc.order_id = o.id
  AND pc.restaurant_id IS NULL;

-- 2. Garder restaurant_id à jour automatiquement à l'insertion
CREATE OR REPLACE FUNCTION public.set_payment_code_restaurant_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.restaurant_id IS NULL THEN
    SELECT restaurant_id INTO NEW.restaurant_id
    FROM public.orders WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_payment_code_restaurant_id ON public.payment_codes;
CREATE TRIGGER trg_set_payment_code_restaurant_id
  BEFORE INSERT ON public.payment_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_payment_code_restaurant_id();

-- 3. Activer RLS et n'autoriser que le propriétaire du restaurant concerné
ALTER TABLE public.payment_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages own payment codes" ON public.payment_codes;
CREATE POLICY "Owner manages own payment codes"
  ON public.payment_codes
  FOR ALL
  USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
  )
  WITH CHECK (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL
  );

-- Le client public (commande + paiement par un client, pas encore connecté)
-- doit pouvoir créer un code de paiement pour SA commande
DROP POLICY IF EXISTS "Public creates payment code for own order" ON public.payment_codes;
CREATE POLICY "Public creates payment code for own order"
  ON public.payment_codes
  FOR INSERT
  WITH CHECK (true);
