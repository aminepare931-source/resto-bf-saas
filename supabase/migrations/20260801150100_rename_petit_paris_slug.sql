-- À exécuter UNE SEULE FOIS dans Supabase SQL Editor, après la migration
-- 20260801150000_clean_restaurant_slugs.sql.
--
-- Renomme le lien public de "Petit Paris" en un slug propre.
-- ⚠️ Si un QR code a déjà été imprimé avec l'ancien lien (celui qui
-- contient "5a17" ou un autre suffixe), il cessera de fonctionner
-- après ce changement — il faudra réimprimer les QR codes avec le
-- nouveau lien.

UPDATE public.restaurants
SET slug = 'petit-paris'
WHERE name = 'Petit Paris'
  AND NOT EXISTS (
    SELECT 1 FROM public.restaurants WHERE slug = 'petit-paris'
  );

-- Vérification : affiche le nouveau lien
SELECT name, slug FROM public.restaurants WHERE name = 'Petit Paris';
