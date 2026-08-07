-- Construit le vrai parcours de paiement (avant, un code était généré
-- mais rien ne se passait côté client, et rien ne permettait à l'admin
-- de "valider" un paiement reçu).

-- 1. État de paiement sur la commande (source de vérité unique)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid'));

-- 2. État du code de paiement lui-même (cycle de vie mobile money)
ALTER TABLE public.payment_codes
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'claimed', 'confirmed', 'rejected'));

-- 3. Le client doit pouvoir voir les infos de paiement de SA commande
--    (montant, méthode, code, statut) sans exposer ça publiquement à
--    n'importe qui — fonction sécurisée comme pour le suivi de commande.
CREATE OR REPLACE FUNCTION public.get_order_payment(p_order_id uuid)
RETURNS TABLE (method text, amount numeric, code text, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT method, amount, code, status
  FROM public.payment_codes
  WHERE order_id = p_order_id
  ORDER BY created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_payment(uuid) TO anon, authenticated;

-- 4. Le client déclare avoir payé (passe le code en 'claimed'). On vérifie
--    le code pour éviter qu'un visiteur au hasard ne déclare payée une
--    commande qui n'est pas la sienne.
CREATE OR REPLACE FUNCTION public.client_claim_payment(p_order_id uuid, p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int;
BEGIN
  UPDATE public.payment_codes
  SET status = 'claimed'
  WHERE order_id = p_order_id
    AND code = p_code
    AND status = 'pending';
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated > 0 THEN
    UPDATE public.orders SET payment_status = 'pending' WHERE id = p_order_id;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.client_claim_payment(uuid, text) TO anon, authenticated;
