# Plan — Refonte fonctionnelle Resto BF

Beaucoup de demandes dans un seul message. Je propose de tout traiter en un cycle structuré, puis on valide.

## 1. Identité visuelle (logo + arrière-plan landing)
- Intégration du **logo RestoBF** (fichier image-9.png) comme asset Lovable, utilisé dans :
  - Topbar de la landing (remplace le « R » doré actuel)
  - Sidebar dashboard / super-admin
  - Footer + favicon + balises `og:image`
- Mise en place d'un **arrière-plan plein écran** sur la page d'accueil : visuel sombre cuisine/braises + dégradé voilé (lisibilité du texte), couvrant 100% du viewport derrière le hero.

## 2. Numéro de service mis à jour
- Le contact reste **+226 55 30 08 68** et **aminepare931@gmail.com** (déjà en place dans `SubscribeContactModal`). Je vérifie qu'aucun ancien numéro/email ne traîne ailleurs (footer, super-admin, facturation, page custom-orders).

## 3. QR Code → bonne URL
- Bug actuel : le QR encode `window.location.origin` côté preview Lovable, donc le scan ouvre Lovable.
- Fix : utiliser **le domaine publié** (`project--<id>.lovable.app` ou domaine personnalisé) via variable d'env / champ configurable, avec fallback intelligent. Champ « Domaine du site » dans `dashboard/contenu`.

## 4. Mode hors-ligne (PWA)
- Conversion du site **public restaurant `/r/$slug`** + dashboard en **PWA installable**, avec :
  - `manifest.webmanifest` (icônes générées depuis le logo)
  - Service Worker (via `vite-plugin-pwa`) : cache app shell + dernières données menus/avis/galerie/tables
  - Stratégie : `NetworkFirst` pour Supabase reads avec fallback cache ; `CacheFirst` pour assets
  - Bandeau « Hors ligne — données en cache »
  - Limites honnêtes : les écritures (commandes, réservations) sont mises en file et **envoyées au retour de la connexion** (queue IndexedDB simple)

## 5. Suivi des tables + commandes cuisine
Nouveau module **Tables & Commandes** :
- Table SQL `restaurant_tables` (numéro, capacité, statut: libre/occupée/réservée, zone)
- Table SQL `orders` (table_id, items jsonb, statut: nouveau → en cuisine → prêt → servi → payé, total, notes, source: qr/whatsapp/manuel, created_at)
- Page `/dashboard/tables` : plan visuel des tables, statut temps réel (Supabase Realtime)
- Page `/dashboard/cuisine` (vue chef) : kanban des commandes par statut, regroupées **par table**
- QR Code **par table** : `/r/<slug>?table=12` → le client commande, la commande est associée à la table 12
- Vue publique commande : panier + envoi → crée une ligne `orders` côté admin

## 6. Commandes côté admin + relais WhatsApp
- Quand un client commande depuis le site, la commande arrive dans `/dashboard/commandes` (badge notif + son)
- Bouton **« Envoyer sur WhatsApp »** : ouvre `wa.me/<numéro resto>` avec message pré-rempli (résumé + table + total) — option toggle « envoyer auto au numéro de l'admin »
- Realtime : nouvelles commandes apparaissent sans refresh

## 7. Sécurité — 5 failles critiques à corriger
Audit + corrections :
1. **Validation des entrées formulaires** (zod) sur inscription, réservations, custom-orders, commandes — limites de longueur, sanitization
2. **Politiques RLS** : revue de `restaurants`, `menu_items`, `reviews`, `gallery_images`, `invoices`, `custom_orders` — s'assurer qu'aucune politique ne fuit `user_id` d'autres comptes
3. **Escalade super_admin** : verrouiller `claim_super_admin` (déjà guard `super_admin_exists`, mais ajouter rate limit applicatif + audit log)
4. **XSS** : retirer tout `dangerouslySetInnerHTML` non sanitizé (templates publics)
5. **Stockage** : politiques bucket `restaurant-media` (lecture publique OK, écriture restreinte au propriétaire), taille max upload, types MIME
6. (bonus) Headers de sécurité (CSP basique, Referrer-Policy) via root route

Je lance `security--run_security_scan` pour avoir la liste officielle et je traite chaque finding.

## Détails techniques (pour info)
- Stack : TanStack Start + Supabase + Tailwind v4
- PWA : `vite-plugin-pwa` (workbox)
- Realtime : `supabase.channel().on('postgres_changes')`
- Migrations : 1 seule migration regroupant `restaurant_tables`, `orders`, RLS + GRANTs
- Domaine publié exposé via `import.meta.env.VITE_PUBLIC_SITE_URL` (fallback `window.location.origin`)

## Ordre d'exécution
1. Scan sécurité (parallèle au reste)
2. Migration tables + orders
3. Logo + background landing + footer/topbar
4. Fix QR (domaine publié + QR par table)
5. Module Tables / Cuisine / Commandes + Realtime + WhatsApp
6. PWA + offline cache + queue d'envoi
7. Corrections sécurité + validation zod
8. Vérif build + smoke test Playwright

OK pour partir là-dessus ? Réponds **oui** et j'enchaîne tout d'un coup.
