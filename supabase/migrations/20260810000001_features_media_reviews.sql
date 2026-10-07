-- Fonctionnalités réelles : vidéos en galerie + réponses du propriétaire aux avis

ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image'
  CHECK (media_type IN ('image', 'video'));

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS owner_reply text,
  ADD COLUMN IF NOT EXISTS owner_replied_at timestamptz;
