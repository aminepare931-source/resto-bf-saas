-- Ajoute des colonnes pour stocker la position GPS du client en mode
-- livraison (détection automatique via le navigateur), pour que l'admin
-- puisse voir précisément où livrer au lieu de se fier uniquement à une
-- adresse tapée à la main.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_lat double precision,
  ADD COLUMN IF NOT EXISTS delivery_lng double precision;
