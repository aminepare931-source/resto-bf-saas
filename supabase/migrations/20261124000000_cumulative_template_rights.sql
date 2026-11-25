-- Droits de templates cumulatifs : un forfait supérieur inclut les templates des forfaits inférieurs.
--   basique  -> Classique
--   standard -> Classique + 4 Standard
--   premium  -> Classique + 4 Standard + 4 Premium
-- Avant, la case « Standard » n'était cochée que pour le forfait Standard : un client Premium
-- ne pouvait pas utiliser les templates Standard, où fonctionne la personnalisation couleurs/police.
-- Cette migration ne fait qu'AJOUTER des forfaits aux lignes existantes (rien n'est retiré),
-- les réglages déjà faits par le super admin sont donc conservés.

UPDATE public.plan_features
SET plans = (
      SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(plans || ARRAY['basique', 'standard', 'premium']) AS p
    ),
    updated_at = now()
WHERE slug = 'template-basique';

UPDATE public.plan_features
SET plans = (
      SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(plans || ARRAY['standard', 'premium']) AS p
    ),
    updated_at = now()
WHERE slug = 'template-standard';
