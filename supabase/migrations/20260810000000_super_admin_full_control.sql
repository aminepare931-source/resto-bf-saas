-- =====================================================================
-- Super admin : contrôle total sur toutes les tables + gestion des comptes
-- Idempotent : peut être rejoué sans risque.
-- =====================================================================

-- 1) Politique "tout faire" pour super_admin sur chaque table métier
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'restaurants', 'menu_items', 'gallery_images', 'reviews', 'reservations',
    'orders', 'staff_members', 'stock_items', 'invoices', 'payment_codes',
    'restaurant_tables', 'chat_messages', 'custom_orders', 'plan_features',
    'user_roles'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "Super admin full access" ON public.%I', t);
      EXECUTE format(
        'CREATE POLICY "Super admin full access" ON public.%I FOR ALL TO authenticated '
        'USING (public.has_role(auth.uid(), ''super_admin'')) '
        'WITH CHECK (public.has_role(auth.uid(), ''super_admin''))',
        t
      );
    END IF;
  END LOOP;
END $$;

-- 2) Liste des comptes (email, rôle, nombre de restaurants) — super_admin uniquement
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_super_admin boolean,
  restaurants_count integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  RETURN QUERY
    SELECT u.id,
           u.email::text,
           u.created_at,
           u.last_sign_in_at,
           EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'super_admin'),
           (SELECT count(*)::int FROM public.restaurants x WHERE x.user_id = u.id)
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 3) Donner / retirer le rôle super_admin (jamais le dernier, jamais soi-même)
CREATE OR REPLACE FUNCTION public.admin_set_super_admin(_user_id uuid, _grant boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'super_admin')
    ON CONFLICT DO NOTHING;
  ELSE
    IF _user_id = auth.uid() THEN
      RAISE EXCEPTION 'Vous ne pouvez pas retirer votre propre rôle';
    END IF;
    IF (SELECT count(*) FROM public.user_roles WHERE role = 'super_admin') <= 1 THEN
      RAISE EXCEPTION 'Impossible de retirer le dernier super admin';
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_super_admin(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_super_admin(uuid, boolean) TO authenticated;

-- 4) Supprimer un compte (et ses restaurants via les clés étrangères) — pas soi-même
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Vous ne pouvez pas supprimer votre propre compte';
  END IF;
  DELETE FROM public.restaurants WHERE user_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- 5) Facturation protégée : seul un super admin (ou le serveur) change plan / abonnement.
--    Avant : "Owner can update own restaurant" permettait à un client de se mettre
--    lui-même en premium via l'API.
CREATE OR REPLACE FUNCTION public.protect_restaurant_billing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Serveur / éditeur SQL / triggers d'inscription (pas d'utilisateur) et super admins : libre
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'super_admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.plan := 'trial';
    NEW.subscription_status := 'trial';
    NEW.trial_ends_at := now() + interval '30 days';
    NEW.subscription_ends_at := NULL;
  ELSE
    NEW.plan := OLD.plan;
    NEW.subscription_status := OLD.subscription_status;
    NEW.trial_ends_at := OLD.trial_ends_at;
    NEW.subscription_ends_at := OLD.subscription_ends_at;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_restaurant_billing ON public.restaurants;
CREATE TRIGGER trg_protect_restaurant_billing
  BEFORE INSERT OR UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.protect_restaurant_billing();

-- 6) Inscription : toujours un essai de 30 jours (comme annoncé sur le site).
--    Avant : le forfait venait de raw_user_meta_data (modifiable par le client)
--    et passait directement en 'active' sans paiement. Le super admin active
--    les forfaits payants une fois le paiement reçu.
--    On conserve la logique de liens propres (slug sans suffixe sauf collision,
--    noms de pages réservés) de 20260801150000.
CREATE OR REPLACE FUNCTION public.handle_new_restaurant_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_name text := meta->>'restaurant_name';
  v_slug text;
BEGIN
  IF v_name IS NULL OR v_name = '' THEN
    RETURN NEW;
  END IF;

  v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);

  IF v_slug = '' THEN
    v_slug := 'restaurant';
  END IF;

  IF v_slug IN ('auth', 'dashboard', 'conditions', 'confidentialite',
                'mentions-legales', 'offline', 'super-admin', 'debug-user',
                'demo', 'r', 'api', 'admin', 'sitemap.xml', 'robots.txt') THEN
    v_slug := v_slug || '-resto';
  END IF;

  IF EXISTS (SELECT 1 FROM public.restaurants WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO public.restaurants (
    user_id, name, slug, city, cuisine, owner_name, phone, whatsapp, email,
    plan, subscription_status, trial_ends_at
  ) VALUES (
    NEW.id, v_name, v_slug,
    COALESCE(meta->>'city', ''),
    meta->>'cuisine',
    COALESCE(meta->>'owner_name', ''),
    COALESCE(meta->>'phone', ''),
    regexp_replace(COALESCE(meta->>'phone',''), '\s|\+', '', 'g'),
    NEW.email,
    'trial', 'trial', now() + interval '30 days'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 7) Expiration automatique côté site public : la vue calcule le statut réel.
--    Un essai ou un abonnement dépassé est vu comme "expired" sans cron.
CREATE OR REPLACE VIEW public.public_restaurants
WITH (security_invoker = true) AS
SELECT
  id, name, slug, city, cuisine, description, address, hours,
  phone, whatsapp, email, plan, logo_url, template, hero_title, hero_subtitle,
  about_text, primary_color, font_family, sections, social_links,
  CASE
    WHEN subscription_status = 'trial' AND trial_ends_at IS NOT NULL AND trial_ends_at < now() THEN 'expired'
    WHEN subscription_status = 'active' AND subscription_ends_at IS NOT NULL AND subscription_ends_at < now() THEN 'expired'
    ELSE subscription_status
  END AS subscription_status,
  offers_delivery
FROM public.restaurants;

GRANT SELECT ON public.public_restaurants TO anon, authenticated;

-- 8) plan_features : identifiant stable (slug).
--    Avant : l'interface utilisait des ids texte alors que la table a des UUID,
--    donc les cases cochées dans « Fonctionnalités » n'étaient jamais enregistrées.
ALTER TABLE public.plan_features ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS plan_features_slug_key ON public.plan_features (slug);

UPDATE public.plan_features SET slug = 'menu-digital' WHERE slug IS NULL AND name = 'Menu digital';
UPDATE public.plan_features SET slug = 'menu-10-plats' WHERE slug IS NULL AND name = 'Jusqu''à 10 plats';
UPDATE public.plan_features SET slug = 'menu-30-plats' WHERE slug IS NULL AND name = 'Jusqu''à 30 plats';
UPDATE public.plan_features SET slug = 'menu-illimite' WHERE slug IS NULL AND name = 'Menu illimité';
UPDATE public.plan_features SET slug = 'categories-plats' WHERE slug IS NULL AND name = 'Catégories de plats';
UPDATE public.plan_features SET slug = 'plats-saisonniers' WHERE slug IS NULL AND name = 'Plats saisonniers';
UPDATE public.plan_features SET slug = 'commande-whatsapp' WHERE slug IS NULL AND name = 'Commande WhatsApp';
UPDATE public.plan_features SET slug = 'panier-commande' WHERE slug IS NULL AND name = 'Panier de commande';
UPDATE public.plan_features SET slug = 'historique-commandes' WHERE slug IS NULL AND name = 'Historique des commandes';
UPDATE public.plan_features SET slug = 'notifications-commandes' WHERE slug IS NULL AND name = 'Notifications commandes';
UPDATE public.plan_features SET slug = 'qr-code' WHERE slug IS NULL AND name = 'QR Code restaurant';
UPDATE public.plan_features SET slug = 'qr-code-table' WHERE slug IS NULL AND name = 'QR Code par table';
UPDATE public.plan_features SET slug = 'qr-code-personnalise' WHERE slug IS NULL AND name = 'QR Code personnalisé';
UPDATE public.plan_features SET slug = 'reservations-basiques' WHERE slug IS NULL AND name = 'Réservations basiques';
UPDATE public.plan_features SET slug = 'reservations-avancees' WHERE slug IS NULL AND name = 'Réservations avancées';
UPDATE public.plan_features SET slug = 'calendrier-reservations' WHERE slug IS NULL AND name = 'Calendrier des réservations';
UPDATE public.plan_features SET slug = 'confirmation-auto' WHERE slug IS NULL AND name = 'Confirmation automatique';
UPDATE public.plan_features SET slug = 'rappel-reservation' WHERE slug IS NULL AND name = 'Rappel de réservation';
UPDATE public.plan_features SET slug = 'template-basique' WHERE slug IS NULL AND name = '1 Template basique';
UPDATE public.plan_features SET slug = 'template-standard' WHERE slug IS NULL AND name = '4 Templates Standard';
UPDATE public.plan_features SET slug = 'template-premium' WHERE slug IS NULL AND name = '4 Templates Premium';
UPDATE public.plan_features SET slug = 'personnalisation-couleurs' WHERE slug IS NULL AND name = 'Personnalisation couleurs';
UPDATE public.plan_features SET slug = 'personnalisation-police' WHERE slug IS NULL AND name = 'Personnalisation police';
UPDATE public.plan_features SET slug = 'stats-essentielles' WHERE slug IS NULL AND name = 'Statistiques essentielles';
UPDATE public.plan_features SET slug = 'stats-basiques' WHERE slug IS NULL AND name = 'Statistiques basiques';
UPDATE public.plan_features SET slug = 'stats-avancees' WHERE slug IS NULL AND name = 'Statistiques avancées';
UPDATE public.plan_features SET slug = 'stats-ventes' WHERE slug IS NULL AND name = 'Statistiques des ventes';
UPDATE public.plan_features SET slug = 'stats-clients' WHERE slug IS NULL AND name = 'Statistiques clients';
UPDATE public.plan_features SET slug = 'export-statistiques' WHERE slug IS NULL AND name = 'Export statistiques';
UPDATE public.plan_features SET slug = 'galerie-photos' WHERE slug IS NULL AND name = 'Galerie photos';
UPDATE public.plan_features SET slug = 'galerie-illimitee' WHERE slug IS NULL AND name = 'Galerie illimitée';
UPDATE public.plan_features SET slug = 'galerie-videos' WHERE slug IS NULL AND name = 'Galerie vidéos';
UPDATE public.plan_features SET slug = 'avis-clients' WHERE slug IS NULL AND name = 'Avis clients';
UPDATE public.plan_features SET slug = 'repondre-avis' WHERE slug IS NULL AND name = 'Répondre aux avis';
UPDATE public.plan_features SET slug = 'avis-google' WHERE slug IS NULL AND name = 'Avis Google intégrés';
UPDATE public.plan_features SET slug = 'facturation-pdf' WHERE slug IS NULL AND name = 'Facturation PDF basique';
UPDATE public.plan_features SET slug = 'facturation-logo' WHERE slug IS NULL AND name = 'Facturation PDF + logo';
UPDATE public.plan_features SET slug = 'facture-auto' WHERE slug IS NULL AND name = 'Facturation automatique';
UPDATE public.plan_features SET slug = 'devis' WHERE slug IS NULL AND name = 'Devis en ligne';
UPDATE public.plan_features SET slug = 'gestion-employes' WHERE slug IS NULL AND name = 'Gestion employés';
UPDATE public.plan_features SET slug = 'login-staff-pin' WHERE slug IS NULL AND name = 'Connexion staff par PIN';
UPDATE public.plan_features SET slug = 'espace-cuisine' WHERE slug IS NULL AND name = 'Espace cuisine';
UPDATE public.plan_features SET slug = 'planning-staff' WHERE slug IS NULL AND name = 'Planning du staff';
UPDATE public.plan_features SET slug = 'plan-salle' WHERE slug IS NULL AND name = 'Plan de salle interactif';
UPDATE public.plan_features SET slug = 'etat-tables' WHERE slug IS NULL AND name = 'État des tables';
UPDATE public.plan_features SET slug = 'reservation-table' WHERE slug IS NULL AND name = 'Réservation par table';
UPDATE public.plan_features SET slug = 'chat-interne' WHERE slug IS NULL AND name = 'Chat interne';
UPDATE public.plan_features SET slug = 'notifications-chat' WHERE slug IS NULL AND name = 'Notifications chat';
UPDATE public.plan_features SET slug = 'chat-fichiers' WHERE slug IS NULL AND name = 'Partage de fichiers';
UPDATE public.plan_features SET slug = 'promotions' WHERE slug IS NULL AND name = 'Promotions';
UPDATE public.plan_features SET slug = 'campagnes-whatsapp' WHERE slug IS NULL AND name = 'Campagnes WhatsApp';
UPDATE public.plan_features SET slug = 'fidelite' WHERE slug IS NULL AND name = 'Programme de fidélité';
UPDATE public.plan_features SET slug = 'reseaux-sociaux' WHERE slug IS NULL AND name = 'Liens réseaux sociaux';
UPDATE public.plan_features SET slug = 'gestion-stocks' WHERE slug IS NULL AND name = 'Gestion des stocks';
UPDATE public.plan_features SET slug = 'alertes-stocks' WHERE slug IS NULL AND name = 'Alertes stocks bas';
UPDATE public.plan_features SET slug = 'fournisseurs' WHERE slug IS NULL AND name = 'Gestion fournisseurs';
UPDATE public.plan_features SET slug = 'messagerie-whatsapp' WHERE slug IS NULL AND name = 'Messagerie WhatsApp';
UPDATE public.plan_features SET slug = 'reponses-rapides' WHERE slug IS NULL AND name = 'Réponses rapides';
UPDATE public.plan_features SET slug = 'broadcast' WHERE slug IS NULL AND name = 'Diffusion groupée';
UPDATE public.plan_features SET slug = 'parametres-site' WHERE slug IS NULL AND name = 'Paramètres du site';
UPDATE public.plan_features SET slug = 'logo-personnalise' WHERE slug IS NULL AND name = 'Logo personnalisé';
UPDATE public.plan_features SET slug = 'domaine-personnalise' WHERE slug IS NULL AND name = 'Nom de domaine';
UPDATE public.plan_features SET slug = 'mode-sombre' WHERE slug IS NULL AND name = 'Mode sombre';
UPDATE public.plan_features SET slug = 'theme-neon' WHERE slug IS NULL AND name = 'Thème Néon';
UPDATE public.plan_features SET slug = 'theme-jour' WHERE slug IS NULL AND name = 'Thème Jour';
UPDATE public.plan_features SET slug = 'contenu-branding' WHERE slug IS NULL AND name = 'Contenu & branding';
UPDATE public.plan_features SET slug = 'apercu-dashboard' WHERE slug IS NULL AND name = 'Aperçu du dashboard';
UPDATE public.plan_features SET slug = 'support-prioritaire' WHERE slug IS NULL AND name = 'Support prioritaire';
UPDATE public.plan_features SET slug = 'support-standard' WHERE slug IS NULL AND name = 'Support standard';
UPDATE public.plan_features SET slug = 'formation' WHERE slug IS NULL AND name = 'Formation en ligne';
UPDATE public.plan_features SET slug = 'rapports-mensuels' WHERE slug IS NULL AND name = 'Rapports mensuels';
UPDATE public.plan_features SET slug = 'rapports-ventes' WHERE slug IS NULL AND name = 'Rapports de ventes';
UPDATE public.plan_features SET slug = 'export-donnees' WHERE slug IS NULL AND name = 'Export des données';

INSERT INTO public.plan_features (slug, name, description, category, icon, plans) VALUES
  ('menu-digital', 'Menu digital', 'Menu en ligne avec photos et prix', 'menu', '📱', ARRAY['basique', 'standard', 'premium']),
  ('menu-10-plats', 'Jusqu''à 10 plats', 'Limite de 10 plats dans le menu', 'menu', '🍽️', ARRAY['basique']),
  ('menu-30-plats', 'Jusqu''à 30 plats', 'Limite de 30 plats dans le menu', 'menu', '🍽️', ARRAY['standard', 'premium']),
  ('menu-illimite', 'Menu illimité', 'Nombre de plats illimité', 'menu', '🍽️', ARRAY['premium']),
  ('categories-plats', 'Catégories de plats', 'Organiser les plats par catégories', 'menu', '📂', ARRAY['standard', 'premium']),
  ('plats-saisonniers', 'Plats saisonniers', 'Ajouter des plats temporaires', 'menu', '🌿', ARRAY['premium']),
  ('commande-whatsapp', 'Commande WhatsApp', 'Bouton de commande directe', 'order', '💬', ARRAY['basique', 'standard', 'premium']),
  ('panier-commande', 'Panier de commande', 'Système de panier multi-plats', 'order', '🛒', ARRAY['standard', 'premium']),
  ('historique-commandes', 'Historique des commandes', 'Voir l''historique complet', 'order', '📋', ARRAY['standard', 'premium']),
  ('notifications-commandes', 'Notifications commandes', 'Notification à chaque commande', 'order', '🔔', ARRAY['premium']),
  ('qr-code', 'QR Code restaurant', 'QR code pour accéder au menu', 'qr', '📲', ARRAY['basique', 'standard', 'premium']),
  ('qr-code-table', 'QR Code par table', 'QR code unique par table', 'qr', '🪑', ARRAY['standard', 'premium']),
  ('qr-code-personnalise', 'QR Code personnalisé', 'QR code avec logo et couleurs', 'qr', '🎨', ARRAY['premium']),
  ('reservations-basiques', 'Réservations basiques', 'Formulaire de réservation simple', 'reservation', '📅', ARRAY['basique']),
  ('reservations-avancees', 'Réservations avancées', 'Réservations avec choix de table', 'reservation', '📅', ARRAY['standard', 'premium']),
  ('calendrier-reservations', 'Calendrier des réservations', 'Vue calendrier', 'reservation', '🗓️', ARRAY['standard', 'premium']),
  ('confirmation-auto', 'Confirmation automatique', 'Confirmation auto des réservations', 'reservation', '✅', ARRAY['premium']),
  ('rappel-reservation', 'Rappel de réservation', 'Rappel SMS/WhatsApp', 'reservation', '⏰', ARRAY['premium']),
  ('template-basique', '1 Template basique', 'Template Classique uniquement', 'template', '🎨', ARRAY['basique']),
  ('template-standard', '4 Templates Standard', 'Soleil, Savane, Vert, Épuré', 'template', '🎨', ARRAY['standard']),
  ('template-premium', '4 Templates Premium', 'Templates avec animations', 'template', '✨', ARRAY['premium']),
  ('personnalisation-couleurs', 'Personnalisation couleurs', 'Changer les couleurs', 'template', '🎨', ARRAY['standard', 'premium']),
  ('personnalisation-police', 'Personnalisation police', 'Changer la police', 'template', '✏️', ARRAY['premium']),
  ('stats-essentielles', 'Statistiques essentielles', 'Vues et commandes de base', 'stats', '📊', ARRAY['basique']),
  ('stats-basiques', 'Statistiques basiques', 'Statistiques détaillées', 'stats', '📊', ARRAY['standard']),
  ('stats-avancees', 'Statistiques avancées', 'Analytics complets', 'stats', '📈', ARRAY['premium']),
  ('stats-ventes', 'Statistiques des ventes', 'Analyse des ventes', 'stats', '💰', ARRAY['premium']),
  ('stats-clients', 'Statistiques clients', 'Analyse comportement clients', 'stats', '👥', ARRAY['premium']),
  ('export-statistiques', 'Export statistiques', 'Exporter PDF/Excel', 'stats', '📥', ARRAY['premium']),
  ('galerie-photos', 'Galerie photos', 'Jusqu''à 10 photos', 'gallery', '🖼️', ARRAY['standard', 'premium']),
  ('galerie-illimitee', 'Galerie illimitée', 'Photos illimitées', 'gallery', '🖼️', ARRAY['premium']),
  ('galerie-videos', 'Galerie vidéos', 'Ajouter des vidéos', 'gallery', '🎬', ARRAY['premium']),
  ('avis-clients', 'Avis clients', 'Système d''avis et témoignages', 'reviews', '⭐', ARRAY['standard', 'premium']),
  ('repondre-avis', 'Répondre aux avis', 'Répondre aux avis clients', 'reviews', '💬', ARRAY['premium']),
  ('avis-google', 'Avis Google intégrés', 'Afficher les avis Google', 'reviews', '🔗', ARRAY['premium']),
  ('facturation-pdf', 'Facturation PDF basique', 'Factures simples', 'billing', '🧾', ARRAY['standard']),
  ('facturation-logo', 'Facturation PDF + logo', 'Factures avec logo', 'billing', '🧾', ARRAY['premium']),
  ('facture-auto', 'Facturation automatique', 'Génération automatique', 'billing', '⚡', ARRAY['premium']),
  ('devis', 'Devis en ligne', 'Créer et envoyer des devis', 'billing', '📄', ARRAY['premium']),
  ('gestion-employes', 'Gestion employés', 'Ajout de staff avec rôles', 'staff', '👥', ARRAY['premium']),
  ('login-staff-pin', 'Connexion staff par PIN', 'Employés se connectent par PIN', 'staff', '🔑', ARRAY['premium']),
  ('espace-cuisine', 'Espace cuisine', 'Interface cuisine avec minuteur', 'staff', '👨‍🍳', ARRAY['premium']),
  ('planning-staff', 'Planning du staff', 'Gérer les horaires', 'staff', '📋', ARRAY['premium']),
  ('plan-salle', 'Plan de salle interactif', 'Gérer les tables', 'tables', '🪑', ARRAY['standard', 'premium']),
  ('etat-tables', 'État des tables', 'Tables libres/occupées en temps réel', 'tables', '🟢', ARRAY['standard', 'premium']),
  ('reservation-table', 'Réservation par table', 'Assigner une table', 'tables', '📌', ARRAY['premium']),
  ('chat-interne', 'Chat interne', 'Communication cuisinier ↔ serveur', 'chat', '💬', ARRAY['standard', 'premium']),
  ('notifications-chat', 'Notifications chat', 'Notifications sonores', 'chat', '🔔', ARRAY['premium']),
  ('chat-fichiers', 'Partage de fichiers', 'Envoyer photos et fichiers', 'chat', '📎', ARRAY['premium']),
  ('promotions', 'Promotions', 'Codes promo et réductions', 'marketing', '🏷️', ARRAY['premium']),
  ('campagnes-whatsapp', 'Campagnes WhatsApp', 'Envoyer des offres', 'marketing', '📢', ARRAY['premium']),
  ('fidelite', 'Programme de fidélité', 'Carte de fidélité digitale', 'marketing', '💎', ARRAY['premium']),
  ('reseaux-sociaux', 'Liens réseaux sociaux', 'Facebook, Instagram', 'marketing', '🌐', ARRAY['standard', 'premium']),
  ('gestion-stocks', 'Gestion des stocks', 'Suivi des ingrédients', 'stock', '📦', ARRAY['standard', 'premium']),
  ('alertes-stocks', 'Alertes stocks bas', 'Notification stock faible', 'stock', '⚠️', ARRAY['standard', 'premium']),
  ('fournisseurs', 'Gestion fournisseurs', 'Liste des fournisseurs', 'stock', '🚚', ARRAY['premium']),
  ('messagerie-whatsapp', 'Messagerie WhatsApp', 'Gérer les conversations', 'messaging', '💬', ARRAY['standard', 'premium']),
  ('reponses-rapides', 'Réponses rapides', 'Modèles de messages', 'messaging', '⚡', ARRAY['premium']),
  ('broadcast', 'Diffusion groupée', 'Envoyer à tous les clients', 'messaging', '📨', ARRAY['premium']),
  ('parametres-site', 'Paramètres du site', 'Modifier les infos', 'settings', '⚙️', ARRAY['basique', 'standard', 'premium']),
  ('logo-personnalise', 'Logo personnalisé', 'Ajouter le logo', 'settings', '🖼️', ARRAY['standard', 'premium']),
  ('domaine-personnalise', 'Nom de domaine', 'Domaine personnalisé', 'settings', '🌐', ARRAY['premium']),
  ('mode-sombre', 'Mode sombre', 'Thème sombre', 'settings', '🌙', ARRAY['standard', 'premium']),
  ('theme-neon', 'Thème Néon', 'Mode néon', 'settings', '💡', ARRAY['premium']),
  ('theme-jour', 'Thème Jour', 'Mode clair', 'settings', '☀️', ARRAY['standard', 'premium']),
  ('contenu-branding', 'Contenu & branding', 'Personnaliser le contenu', 'settings', '🖌️', ARRAY['standard', 'premium']),
  ('apercu-dashboard', 'Aperçu du dashboard', 'Page d''accueil', 'settings', '📊', ARRAY['basique', 'standard', 'premium']),
  ('support-prioritaire', 'Support prioritaire', 'Support WhatsApp dédié', 'support', '🎧', ARRAY['premium']),
  ('support-standard', 'Support standard', 'Support par email', 'support', '📧', ARRAY['standard']),
  ('formation', 'Formation en ligne', 'Guide et tutoriels', 'support', '📚', ARRAY['standard', 'premium']),
  ('rapports-mensuels', 'Rapports mensuels', 'Rapports PDF automatiques', 'reports', '📄', ARRAY['premium']),
  ('rapports-ventes', 'Rapports de ventes', 'Analyse des ventes', 'reports', '📊', ARRAY['premium']),
  ('export-donnees', 'Export des données', 'Exporter en CSV', 'reports', '💾', ARRAY['premium'])
ON CONFLICT (slug) DO NOTHING;
