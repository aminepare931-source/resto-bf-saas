ized# Plan de refonte Resto BF

Ce chantier est large. Je le découpe en 10 lots livrables. Chaque lot peut être validé indépendamment, mais je propose de les enchaîner dans l'ordre ci-dessous (sécurité et séparation des rôles d'abord, puis UX/business).

## Lot 1 — Sécurité & séparation Super Admin (PRIORITÉ 1)

**Problème actuel** : la route `/dashboard/admin` est dans le même espace que le dashboard restaurant, et certains éléments super-admin sont visibles côté restaurant.

- Déplacer toute la zone super-admin sous une URL dédiée : `/super-admin/*` (hors du layout `_authenticated/dashboard`).
- Gate stricte : `beforeLoad` qui vérifie `has_role(uid, 'super_admin')` côté serveur (server function), pas seulement côté client.
- Retirer tous les liens "Super-Admin" du dashboard restaurant. Le seul moyen d'y accéder = connaître l'URL + avoir le rôle.
- Audit RLS sur les 6 tables (`restaurants`, `menu_items`, `reservations`, `reviews`, `gallery_images`, `user_roles`) :
  - vérifier que chaque policy `INSERT/UPDATE/DELETE` est bien scopée à `auth.uid()` via le `user_id` du restaurant propriétaire ;
  - bloquer toute lecture cross-restaurant pour les données privées (réservations, factures futures) ;
  - vérifier que `user_roles` n'est jamais modifiable côté client (seulement via RPC `claim_super_admin` ou super-admin via service role).
- Validation Zod sur tous les formulaires (inscription, menu, réservation, avis, paramètres).
- Limiter la taille des champs texte et des uploads (déjà bucket public — ajouter une politique de taille max côté policy storage).
- Lancer `supabase--linter` + `security--run_security_scan` et corriger les findings critiques.

## Lot 2 — Nouvelle grille tarifaire & fin du "gratuit pour toujours"

- Ajouter colonnes sur `restaurants` :
  - `trial_ends_at TIMESTAMPTZ` (défaut `now() + 14 days` à l'inscription)
  - `subscription_status TEXT` (`trial` | `active` | `expired` | `cancelled`)
  - `plan` accepte désormais : `trial`, `standard`, `standard_plus`, `premium`, `sur_mesure`
- Migration : tout `plan='gratuit'` existant → `plan='trial'`, `trial_ends_at = created_at + 14 days`.
- Server function `check_subscription_status` : si `trial_ends_at < now()` et `status != 'active'` → bloquer l'accès au dashboard (sauf page "Choisir un abonnement").
- Page publique `/tarifs` refaite avec les 4 offres :
  - Essai gratuit 14j
  - Standard 10 000 FCFA/mois
  - Standard Plus 15 000 FCFA/mois
  - Premium 25 000 FCFA/mois
  - Sur Mesure (à partir de 250 000 FCFA) → bouton "Demander une offre sur mesure" (formulaire ou WhatsApp +226 55 30 08 68)

## Lot 3 — Système de paiement temporaire (contact assistance)

- Tous les boutons "S'abonner" ouvrent une modale :
  > « Les paiements électroniques sont actuellement en cours d'intégration. Veuillez contacter notre assistance pour activer votre abonnement. »
  > Contact : **+226 55 30 08 68** — Mohamed Amine Paré
  > Boutons : Appeler / WhatsApp / Email
- Le super-admin pourra ensuite activer manuellement l'abonnement depuis `/super-admin` (changer `plan` + `subscription_status='active'` + `subscription_ends_at`).

## Lot 4 — Rééquilibrage des fonctionnalités

### Standard (+5 fonctionnalités premium légères)
1. QR Code restaurant (téléchargeable PNG/SVG, sans branding)
2. Réservations avancées (occasion, préférence de table, demandes spéciales)
3. Galerie améliorée (catégories, ordre, légendes)
4. Statistiques basiques (vues du site, nb réservations/mois, top plats)
5. Personnalisation avancée (couleur principale, police, bannière)

### Premium (+10 fonctionnalités exclusives)
1. Facturation (cf. Lot 5)
2. Statistiques avancées (graphiques, conversion, sources de trafic)
3. Gestion des employés (table `employees` + rôles serveur/cuisine)
4. Historique complet (réservations + commandes archivées)
5. Rapports PDF mensuels
6. Gestion des promotions (code promo, % réduction, dates)
7. Gestion des événements (soirées spéciales, menus du jour)
8. Notifications avancées (email + WhatsApp automatique sur réservation)
9. Export de données (CSV menus, réservations, avis)
10. Sauvegardes automatiques (snapshot hebdo du contenu)

Les onglets du dashboard afficheront un badge "Premium" verrouillé si le plan ne le couvre pas, avec CTA upgrade.

## Lot 5 — Facturation Premium

- Nouvelle table `invoices` (restaurant_id, numéro, client, lignes JSON, total, TVA, statut, pdf_url).
- Table `restaurant_branding` ou colonnes sur `restaurants` : `logo_url`, `invoice_footer`, `invoice_prefix`.
- Page `/dashboard/facturation` (premium only) :
  - Créer une facture (client, lignes, total auto)
  - Liste, recherche, statut payé/impayé
  - Génération PDF (côté client avec `jspdf` + logo)
  - Bouton Télécharger + Imprimer
- Le logo uploadé apparaît : factures, header dashboard, header site public.

## Lot 6 — Refonte des 4 templates Standard

Repenser `src/components/public/templates.tsx` pour les 4 templates Standard au niveau visuel des Premium :
- typographie soignée (Playfair/Inter, Cormorant, etc. selon template)
- animations fluides (fade-in scroll, parallax léger, hover)
- hiérarchie claire (hero plein écran, sections rythmées)
- 100% responsive mobile-first
- composants modulaires partagés (Hero, MenuGrid, Gallery, Reservation, Footer)
- Chaque template garde son identité (moderne / marché / savane / soleil) mais avec un niveau premium.

## Lot 7 — QR Code professionnel

- Utiliser la lib `qrcode` déjà installée (pas d'API tierce avec branding).
- Générer en local côté client : PNG haute résolution + SVG.
- Le QR pointe vers `https://{domaine-restaurant}/r/{slug}` (ou domaine custom si configuré).
- Aucune mention Lovable / Resto BF dans l'image (juste le logo du resto au centre, optionnel).
- Bouton "Télécharger PNG" / "Télécharger SVG" / "Imprimer carte de table".

## Lot 8 — Administration complète du contenu

Étendre `restaurants` (ou nouvelle table `restaurant_content` JSONB) avec tous les champs éditables :
- `hero_title`, `hero_subtitle`, `hero_image_url`
- `about_title`, `about_text`, `story_text`
- `sections JSONB` (sections personnalisées : titre + texte + image)
- `opening_hours JSONB` (déjà partiellement présent ?)
- `primary_color`, `secondary_color`, `font_family`
- `logo_url`, `banner_url`
- `social_links JSONB` (FB, IG, TikTok)

Nouvelle page `/dashboard/contenu` avec éditeur visuel section par section. Photos/vidéos via le bucket `restaurant-media` déjà en place.

## Lot 9 — Migration des données existantes

- Tous les restaurants `plan='gratuit'` → `plan='trial'` avec essai déjà entamé (ou 14j à partir d'aujourd'hui — à confirmer).
- Initialiser `subscription_status` pour tous.
- Initialiser le contenu éditable depuis les valeurs actuelles.

## Lot 10 — Tests & validation finale

- Tester les 4 templates Standard + 4 Premium sur mobile et desktop.
- Tester flow inscription → essai → expiration → blocage.
- Tester génération facture PDF avec logo.
- Tester séparation super-admin (un compte resto ne doit jamais voir `/super-admin`).
- Re-scan sécurité.

---

## Détails techniques (pour info)

- **Stack** : TanStack Start + Supabase déjà en place.
- **Nouvelles tables** : `invoices`, `employees`, `promotions`, `events`, `restaurant_stats` (vues), `custom_orders` (demandes sur mesure).
- **Nouvelles colonnes `restaurants`** : `trial_ends_at`, `subscription_status`, `subscription_ends_at`, `logo_url`, `hero_title`, `hero_subtitle`, `primary_color`, `font_family`, `sections JSONB`, `social_links JSONB`.
- **RLS** : nouvelle policy super-admin via `has_role(auth.uid(), 'super_admin')` pour lecture/écriture cross-resto.
- **PDF** : `jspdf` + `jspdf-autotable` côté client (pas besoin de worker).
- **Pas de paiement réel** pour l'instant : tout passe par contact WhatsApp.

---

## Question avant de démarrer

Ce chantier représente ~3–5 jours de travail si tout est fait d'un coup. Je propose de **commencer par les Lots 1, 2, 3 et 7 dans un premier livrable** (sécurité + séparation super-admin + nouvelle tarification + contact assistance + QR pro), puis d'enchaîner sur les Lots 4–6 et 8 (refonte templates, fonctionnalités Standard/Premium, facturation, éditeur de contenu) dans un deuxième livrable.

**Confirmes-tu cet ordre, ou veux-tu que je démarre par autre chose (par exemple la refonte visuelle des templates Standard d'abord) ?**
