-- Migration: Ajouter le plan "basique" à la contrainte

-- Supprimer l'ancienne contrainte
ALTER TABLE public.restaurants DROP CONSTRAINT IF EXISTS restaurants_plan_check;

-- Ajouter la nouvelle contrainte avec "basique"
ALTER TABLE public.restaurants
  ADD CONSTRAINT restaurants_plan_check
  CHECK (plan IN ('trial','basique','standard','premium','sur_mesure','gratuit'));

-- Mettre à jour les plans existants "gratuit" vers "basique" (optionnel)
-- UPDATE public.restaurants SET plan = 'basique' WHERE plan = 'gratuit';