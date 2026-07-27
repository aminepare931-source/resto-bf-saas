# Cahier de Conception — Resto BF

**Version** : 1.0  
**Date** : Juillet 2025  
**Auteur** : Analyse automatique du codebase  
**Statut** : Complet

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Structure des dossiers](#4-structure-des-dossiers)
5. [Base de données Supabase](#5-base-de-données-supabase)
6. [Système d'authentification](#6-système-dauthentification)
7. [Système de rôles et permissions](#7-système-de-rôles-et-permissions)
8. [Plans d'abonnement et feature gating](#8-plans-dabonnement-et-feature-gating)
9. [Routes et navigation](#9-routes-et-navigation)
10. [Pages et fonctionnalités](#10-pages-et-fonctionnalités)
11. [Composants](#11-composants)
12. [Hooks personnalisés](#12-hooks-personnalisés)
13. [Types et interfaces](#13-types-et-interfaces)
14. [Système de design](#14-système-de-design)
15. [Templates publics](#15-templates-publics)
16. [Intégrations externes](#16-intégrations-externes)
17. [PWA et offline](#17-pwa-et-offline)
18. [Déploiement](#18-déploiement)
19. [Sécurité](#19-sécurité)
20. [Performance](#20-performance)

---

## 1. Vue d'ensemble

### 1.1 Présentation

**Resto BF** est un SaaS (Software as a Service) complet pour les restaurants, maquis et fast-foods au Burkina Faso. L'application permet à un restaurateur de créer en 5 minutes un site web professionnel avec :

- Menu digital interactif
- Commandes WhatsApp automatiques
- Réservations en ligne
- Gestion des tables
- Espace cuisine temps réel
- Gestion du staff
- Statistiques avancées
- Facturation PDF
- Galerie photos
- Ais clients
- Chat interne
- Messagerie WhatsApp
- Gestion des stocks
- QR Code restaurant

### 1.2 Positionnement

- **Cible** : Restaurants, maquis, fast-foods au Burkina Faso
- **Langue** : Français
- **Monnaie** : FCFA (Franc CFA)
- **Paiements** : Orange Money, Moov Money, Wave, Espèces
- **Support** : WhatsApp 7j/7

### 1.3 Valeurs clés

- 100% Burkina
- Installation en 5 minutes
- Sans carte bancaire pour l'essai
- Annulation à tout moment
- Pas de commission sur les ventes

---

## 2. Stack technique

### 2.1 Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| **React** | 19.2.0 | Framework UI |
| **TypeScript** | 5.8.3 | Typage statique |
| **Vite** | 8.0.16 | Build tool |
| **TanStack Router** | 1.168.25 | Routage |
| **TanStack Query** | 5.83.0 | Cache et état serveur |
| **TanStack Start** | 1.167.50 | SSR/SSG |
| **Tailwind CSS** | 4.2.1 | Styling |
| **ShadCN/ui** | Dernière | Composants UI |
| **Radix UI** | Dernière | Primitives accessibles |
| **Lucide React** | 0.575.0 | Icônes |
| **Recharts** | 2.15.4 | Graphiques |
| **jsPDF** | 4.2.1 | Génération PDF |
| **QRCode** | 1.5.4 | Génération QR codes |
| **Sonner** | 2.0.7 | Notifications toast |
| **React Hook Form** | 7.71.2 | Formulaires |
| **Zod** | 3.24.2 | Validation |
| **date-fns** | 4.1.0 | Dates |
| **Embla Carousel** | 8.6.0 | Carousel |
| **Vaul** | 1.1.2 | Drawer |
| **CMDK** | 1.1.1 | Command palette |
| **Input OTP** | 1.4.2 | Code PIN |

### 2.2 Backend

| Technologie | Version | Usage |
|------------|---------|-------|
| **Supabase** | 2.108.1 | Backend as a Service |
| **PostgreSQL** | Dernière | Base de données |
| **Supabase Auth** | - | Authentification |
| **Supabase Storage** | - | Stockage fichiers |
| **Supabase Realtime** | - | WebSockets |
| **Supabase Edge Functions** | - | Serverless (2FA email) |

### 2.3 Outils

| Outil | Usage |
|-------|-------|
| **ESLint** | Linting |
| **Prettier** | Formatage |
| **Nitro** | Server runtime |
| **Workbox** | Service Worker |
| **Vite PWA** | PWA |

---

## 3. Architecture du projet

### 3.1 Pattern architectural

L'application suit une architecture **SPA (Single Page Application)** avec :

- **TanStack Router** pour le routage file-based
- **TanStack Query** pour la gestion d'état serveur
- **Supabase** comme backend complet (BaaS)
- **SSR désactivé** (`ssr: false` sur toutes les routes) pour simplifier le déploiement

### 3.2 Flux de données

```
Composant React
    ↓
TanStack Query (cache)
    ↓
Supabase Client
    ↓
Supabase API (REST/Realtime)
    ↓
PostgreSQL
```

### 3.3 Authentification

```
Utilisateur
    ↓
Supabase Auth (email/mot de passe ou Google OAuth)
    ↓
Session JWT
    ↓
Middleware RLS (Row Level Security)
    ↓
Accès aux données
```

---

## 4. Structure des dossiers

```
resto-bf-saas/
├── .env.example                 # Template variables d'environnement
├── .gitignore
├── .prettierrc
├── AGENTS.md                    # Instructions pour les agents
├── APPLIQUER_MIGRATIONS.md      # Guide migrations
├── AUTH_SETUP.md                # Guide authentification
├── bun.lock
├── bunfig.toml
├── components.json              # Configuration ShadCN
├── DEPLOYMENT.md                # Guide déploiement
├── eslint.config.js
├── fix-plans.js
├── GUIDE_2FA_EMAIL.md
├── GUIDE_ACCES_CUISINIER.md
├── GUIDE_CUISINIER.md
├── package.json
├── package-lock.json
├── run-fix.cjs
├── sw.js                        # Service Worker
├── TESTING.md
├── tsconfig.json
├── VERIFIER_RLS.md
├── vite.config.ts
├── public/                      # Assets statiques
│   ├── bg-marché.jpg
│   ├── bg-moderne.jpg
│   ├── bg-saas.jpg
│   ├── bg-savane.jpg
│   ├── bg-soleil.webp
│   ├── manifest.webmanifest
│   ├── restobf-logo.png
│   ├── icons/
│   └── premium-bgs/
├── src/
│   ├── router.tsx               # Configuration du routeur
│   ├── routeTree.gen.ts         # Arbre de routes (généré)
│   ├── server.ts                # Entry point serveur
│   ├── start.ts                 # Configuration TanStack Start
│   ├── styles.css               # Styles globaux + design system
│   ├── theme.css                # Thèmes additionnels
│   ├── assets/                  # Assets importés
│   ├── components/              # Composants réutilisables
│   │   ├── InvoiceCustomizer.tsx
│   │   ├── OfflineBanner.tsx
│   │   ├── StorageImage.tsx
│   │   ├── SubscribeContactModal.tsx
│   │   ├── admin/
│   │   │   └── PaymentCodeModal.tsx
│   │   ├── auth/
│   │   │   └── AuthShell.tsx
│   │   ├── dashboard/
│   │   │   └── Placeholder.tsx
│   │   ├── invoices/
│   │   │   └── InvoiceBuilder.tsx
│   │   ├── landing/
│   │   │   ├── Counter.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Particles.tsx
│   │   │   ├── Reveal.tsx
│   │   │   └── Topbar.tsx
│   │   ├── public/
│   │   │   ├── demo-data.ts
│   │   │   ├── OrderCart.tsx
│   │   │   ├── OrderTracking.tsx
│   │   │   ├── premium-templates.tsx
│   │   │   ├── shared.tsx
│   │   │   ├── templates.tsx
│   │   │   └── templates/
│   │   └── ui/                  # ShadCN components
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── Breadcrumbs.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── Modal.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── ThemeToggle.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       └── tooltip.tsx
│   ├── hooks/                   # Hooks personnalisés
│   │   ├── use-auth.ts
│   │   ├── use-debounce.ts
│   │   ├── use-is-super-admin.ts
│   │   ├── use-my-restaurant.ts
│   │   ├── use-realtime.ts
│   │   ├── use-staff-role.ts
│   │   └── use-theme.ts
│   ├── integrations/            # Intégrations externes
│   │   └── supabase/
│   │       └── client.ts        # Client Supabase
│   ├── lib/                     # Utilitaires
│   │   ├── lovable-error-reporting.ts
│   │   ├── pwa.ts
│   │   ├── site-url.ts
│   │   ├── storage.ts
│   │   ├── validation.ts
│   │   └── invoice-templates.ts
│   ├── routes/                  # Routes (file-based)
│   │   ├── __root.tsx           # Route racine
│   │   ├── index.tsx            # Landing page
│   │   ├── debug-user.tsx       # Debug utilisateur
│   │   ├── offline.tsx          # Page hors ligne
│   │   ├── r.$slug.tsx          # Restaurant public
│   │   ├── super-admin.tsx      # Super administration
│   │   ├── _authenticated/      # Layout authentifié
│   │   │   ├── route.tsx
│   │   │   ├── dashboard.tsx    # Layout dashboard
│   │   │   ├── dashboard.index.tsx
│   │   │   ├── dashboard.menu.tsx
│   │   │   ├── dashboard.commandes.tsx
│   │   │   ├── dashboard.cuisine.tsx
│   │   │   ├── dashboard.tables.tsx
│   │   │   ├── dashboard.stocks.tsx
│   │   │   ├── dashboard.statistiques.tsx
│   │   │   ├── dashboard.staff.tsx
│   │   │   ├── dashboard.reservations.tsx
│   │   │   ├── dashboard.qr-code.tsx
│   │   │   ├── dashboard.parametres.tsx
│   │   │   ├── dashboard.paiements.tsx
│   │   │   ├── dashboard.messaging.tsx
│   │   │   ├── dashboard.menu.tsx
│   │   │   ├── dashboard.galerie.tsx
│   │   │   ├── dashboard.facturation.tsx
│   │   │   ├── dashboard.chat.tsx
│   │   │   ├── dashboard.avis.tsx
│   │   │   ├── dashboard.contenu.tsx
│   │   │   ├── dashboard.templates.tsx
│   │   │   └── dashboard.commandes.tsx
│   │   └── auth/                # Authentification
│   │       ├── index.tsx
│   │       ├── connexion.tsx
│   │       ├── inscription.tsx
│   │       ├── callback.tsx
│   │       ├── choisir-template.tsx
│   │       ├── abonnement.tsx
│   │       └── staff-login.tsx
│   ├── styles/                  # Styles additionnels
│   ├── types/                   # Types TypeScript
│   │   └── index.ts
│   └── theme.css                # Variables CSS
└── supabase/
    ├── config.toml               # Configuration Supabase
    ├── fix-has-role.sql
    ├── functions/                # Edge Functions
    │   └── send-2fa-email/
    │       └── index.ts
    └── migrations/               # Migrations SQL
        ├── 20240630_add_public_site_url.sql
        ├── 20240701_add_invoice_colors.sql
        ├── 20240701_add_invoice_fields.sql
        ├── 20240701_add_staff_pin.sql
        ├── 20240701_add_staff_roles.sql
        ├── 20240701_add_stock_management.sql
        ├── 20260101000000_create_payment_codes.sql
        ├── 20260102000000_create_payment_methods.sql
        └── ... (autres migrations)
```

---

## 5. Base de données Supabase

### 5.1 Tables principales

#### `restaurants`
Table centrale contenant toutes les informations d'un restaurant.

```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- name (TEXT)
- slug (TEXT, unique) — pour les URLs publiques
- plan (TEXT) — trial, basique, standard, premium, sur_mesure
- template (TEXT) — template choisi
- city (TEXT)
- cuisine (TEXT)
- phone (TEXT)
- whatsapp (TEXT)
- email (TEXT)
- address (TEXT)
- hours (TEXT)
- description (TEXT)
- owner_name (TEXT)
- subscription_status (TEXT) — trial, active, expired, cancelled
- trial_ends_at (TIMESTAMPTZ)
- subscription_ends_at (TIMESTAMPTZ)
- logo_url (TEXT)
- hero_title (TEXT)
- hero_subtitle (TEXT)
- about_text (TEXT)
- primary_color (TEXT)
- font_family (TEXT)
- sections (JSONB)
- social_links (JSONB)
- invoice_prefix (TEXT)
- invoice_footer (TEXT)
- public_site_url (TEXT) — URL personnalisée
- notification_orders_channel (TEXT) — admin, whatsapp, both
- notification_reservations_channel (TEXT) — admin, whatsapp, both
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `menu_items`
Plats du menu.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- category (TEXT)
- name (TEXT)
- description (TEXT)
- price (DECIMAL)
- image_url (TEXT)
- available (BOOLEAN)
- position (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `orders`
Commandes des clients.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- table_number (TEXT, nullable)
- customer_name (TEXT, nullable)
- customer_phone (TEXT, nullable)
- items (JSONB) — tableau d'articles
- total (DECIMAL)
- status (TEXT) — new, in_kitchen, ready, served, paid, cancelled
- source (TEXT) — qr, whatsapp, manual
- notes (TEXT, nullable)
- created_at (TIMESTAMPTZ)
- whatsapp_sent_at (TIMESTAMPTZ, nullable)
```

#### `reservations`
Réservations de tables.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- customer_name (TEXT)
- customer_phone (TEXT)
- party_size (INTEGER)
- reservation_date (DATE)
- reservation_time (TIME)
- notes (TEXT, nullable)
- status (TEXT) — pending, confirmed, cancelled
- created_at (TIMESTAMPTZ)
```

#### `reviews`
Avis clients.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- author_name (TEXT)
- rating (INTEGER) — 1 à 5
- comment (TEXT, nullable)
- approved (BOOLEAN) — modération
- created_at (TIMESTAMPTZ)
```

#### `gallery_images`
Galerie photos.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- image_url (TEXT)
- caption (TEXT, nullable)
- position (INTEGER)
- created_at (TIMESTAMPTZ)
```

#### `staff_members`
Membres du staff.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- user_id (UUID, FK → auth.users, nullable)
- name (TEXT)
- email (TEXT)
- phone (TEXT, nullable)
- role (TEXT) — admin, cuisinier, serveur, manager
- pin (TEXT, nullable) — PIN 4 chiffres
- permissions (JSONB)
- is_active (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `restaurant_tables`
Tables du restaurant.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- number (TEXT)
- capacity (INTEGER)
- zone (TEXT, nullable)
- status (TEXT) — free, occupied, reserved, cleaning
- position (INTEGER)
- created_at (TIMESTAMPTZ)
```

#### `stock_items`
Gestion des stocks.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- name (TEXT)
- category (TEXT)
- current_quantity (DECIMAL)
- min_quantity (DECIMAL)
- unit (TEXT)
- last_restock (TIMESTAMPTZ)
- status (TEXT) — ok, low, critical
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `invoices`
Factures.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- invoice_number (TEXT)
- customer_name (TEXT)
- customer_email (TEXT, nullable)
- customer_phone (TEXT, nullable)
- items (JSONB)
- subtotal (DECIMAL)
- tax_rate (DECIMAL)
- total (DECIMAL)
- status (TEXT) — unpaid, paid, cancelled
- issued_at (TIMESTAMPTZ)
- due_at (TIMESTAMPTZ, nullable)
- notes (TEXT, nullable)
- payment_method (TEXT, nullable)
- table_number (TEXT, nullable)
- waiter (TEXT, nullable)
```

#### `payment_codes`
Codes de paiement.

```sql
- id (UUID, PK)
- order_id (UUID, FK → orders)
- code (TEXT)
- method (TEXT) — orange_money, moov_money, cash, wave
- amount (DECIMAL)
- used (BOOLEAN)
- created_at (TIMESTAMPTZ)
```

#### `payment_methods`
Moyens de paiement configurés.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- method (TEXT)
- label (TEXT)
- enabled (BOOLEAN)
- icon (TEXT, nullable)
- phone_number (TEXT, nullable)
- instructions (TEXT, nullable)
- sort_order (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `chat_messages`
Messages du chat interne.

```sql
- id (UUID, PK)
- restaurant_id (UUID, FK → restaurants)
- sender_name (TEXT)
- sender_role (TEXT)
- message (TEXT)
- read (BOOLEAN)
- created_at (TIMESTAMPTZ)
```

#### `user_roles`
Rôles des utilisateurs (pour super admin).

```sql
- user_id (UUID, FK → auth.users)
- role (TEXT) — super_admin
- created_at (TIMESTAMPTZ)
- PK: (user_id, role)
```

#### `plan_features`
Fonctionnalités par plan (gérées par super admin).

```sql
- id (TEXT, PK)
- name (TEXT)
- description (TEXT, nullable)
- category (TEXT)
- icon (TEXT, nullable)
- plans (JSONB) — tableau des plans
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `custom_orders`
Demandes sur mesure (leads).

```sql
- id (UUID, PK)
- restaurant_name (TEXT)
- contact_name (TEXT)
- email (TEXT)
- phone (TEXT)
- city (TEXT, nullable)
- budget (TEXT, nullable)
- message (TEXT)
- status (TEXT) — new, contacted, converted, lost
- created_at (TIMESTAMPTZ)
```

### 5.2 Vues

#### `public_restaurants`
Vue pour l'accès public (sans données sensibles).

```sql
CREATE VIEW public_restaurants AS
SELECT 
  id, name, slug, city, cuisine, description, address, hours,
  phone, whatsapp, logo_url, template, subscription_status,
  plan, primary_color, font_family, social_links
FROM restaurants
WHERE subscription_status != 'expired';
```

### 5.3 Row Level Security (RLS)

Toutes les tables ont des politiques RLS pour garantir que :
- Les restaurateurs ne voient que leurs propres données
- Le staff a un accès limité selon son rôle
- Le public ne voit que les données publiées

---

## 6. Système d'authentification

### 6.1 Méthodes de connexion

1. **Email + Mot de passe** (Supabase Auth)
2. **Google OAuth** (connexion sociale)

### 6.2 Flux d'inscription

```
1. Utilisateur remplit le formulaire d'inscription
   ↓
2. Supabase Auth crée le compte (signUp)
   ↓
3. Redirection vers /auth/choisir-template
   ↓
4. Utilisateur choisit un template
   ↓
5. Redirection vers /dashboard
```

### 6.3 Flux de connexion staff

```
1. Staff entre son nom sur /auth/staff-login
   ↓
2. Recherche dans staff_members par nom (ilike)
   ↓
3. Si trouvé, demande le PIN 4 chiffres
   ↓
4. Vérification du PIN
   ↓
5. Stockage dans sessionStorage
   ↓
6. Redirection vers /dashboard/cuisine (cuisinier) ou /dashboard (autres)
```

### 6.4 Sessions

- **Restaurateurs** : Session Supabase Auth (JWT)
- **Staff** : sessionStorage (pas de JWT, accès simplifié)

---

## 7. Système de rôles et permissions

### 7.1 Rôles utilisateur

| Rôle | Description | Accès |
|------|-------------|-------|
| `super_admin` | Administrateur plateforme | /super-admin |
| `admin` | Propriétaire restaurant | Dashboard complet |
| `manager` | Manager | Dashboard limité |
| `cuisinier` | Cuisinier | /dashboard/cuisine, /dashboard/commandes, /dashboard/stocks, /dashboard/chat |
| `serveur` | Serveur | /dashboard/commandes, /dashboard/tables, /dashboard/chat |

### 7.2 Navigation par rôle

Le layout dashboard (`dashboard.tsx`) adapte la navigation selon le rôle :

- **Admin** : Tous les menus
- **Cuisinier** : Cuisine, Commandes, Stocks, Chat
- **Serveur** : Commandes, Tables, Chat
- **Manager** : Aperçu, Commandes, Cuisine, Stocks, Statistiques, Chat

### 7.3 Super Admin

Accès réservé via :
1. Mot de passe : `admin-1-2-3`
2. Code 2FA envoyé par email (Edge Function)
3. Vérification du rôle dans `user_roles`

---

## 8. Plans d'abonnement et feature gating

### 8.1 Plans

| Plan | Prix | Description |
|------|------|-------------|
| `trial` | 0 FCFA (30 jours) | Essai gratuit |
| `basique` | 5 000 FCFA/mois | Template basique, 10 plats |
| `standard` | 10 000 FCFA/mois | 4 templates, 30 plats |
| `premium` | 15 000 FCFA/mois | Templates animés, illimité |
| `sur_mesure` | 250 000 FCFA+ | Site personnalisé |

### 8.2 Feature gating

Les fonctionnalités sont gérées par :
1. **Vérification du plan** dans les composants
2. **Table `plan_features`** pour la configuration dynamique
3. **Badges visuels** (Premium, etc.)

Exemples de gating :
- Templates Premium → plan premium
- Statistiques avancées → plan premium
- Facturation PDF → plan premium
- Galerie illimitée → plan premium
- Gestion employés → plan premium

---

## 9. Routes et navigation

### 9.1 Routes publiques

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/r/$slug` | Restaurant public |
| `/auth/` | Choix espace (restaurateur/staff) |
| `/auth/connexion` | Connexion |
| `/auth/inscription` | Inscription |
| `/auth/callback` | Callback OAuth |
| `/auth/choisir-template` | Choix template (auth requis) |
| `/auth/abonnement` | Page abonnement basique |
| `/auth/staff-login` | Connexion staff |
| `/offline` | Page hors ligne |
| `/super-admin` | Super administration (super_admin requis) |
| `/debug-user` | Debug utilisateur (dev) |

### 9.2 Routes authentifiées

| Route | Description |
|-------|-------------|
| `/dashboard` | Aperçu |
| `/dashboard/menu` | Gestion menu |
| `/dashboard/commandes` | Commandes en direct |
| `/dashboard/cuisine` | Espace cuisine |
| `/dashboard/tables` | Gestion tables |
| `/dashboard/stocks` | Gestion stocks |
| `/dashboard/statistiques` | Statistiques (Premium) |
| `/dashboard/staff` | Gestion personnel (admin) |
| `/dashboard/reservations` | Réservations |
| `/dashboard/qr-code` | QR Code |
| `/dashboard/parametres` | Paramètres restaurant |
| `/dashboard/paiements` | Paiements |
| `/dashboard/messaging` | Messagerie WhatsApp |
| `/dashboard/galerie` | Galerie photos |
| `/dashboard/facturation` | Facturation (Premium) |
| `/dashboard/chat` | Chat interne |
| `/dashboard/avis` | Avis clients |
| `/dashboard/contenu` | Contenu & branding |
| `/dashboard/templates` | Templates |

---

## 10. Pages et fonctionnalités

### 10.1 Landing page (`/`)

**Composants** : Topbar, Footer, Reveal, Particles  
**Sections** :
- Hero avec aperçu dashboard
- Stats (50+ restaurants, 5 templates, 4.9★, 24/7)
- Templates disponibles
- Fonctionnalités (6 cartes)
- Pourquoi Resto BF (8 cartes)
- Témoignages (3 avis)
- Tarifs (3 plans + sur mesure)
- FAQ (6 questions)
- CTA WhatsApp

**Fonctionnalités** :
- Scroll reveal animations
- Modal de sélection de plan
- Liens vers inscription avec paramètre `plan`

### 10.2 Restaurant public (`/r/$slug`)

**Fonctionnalités** :
- Affichage du template choisi
- Menu digital
- Galerie photos
- Avis clients
- Formulaire de réservation
- Bouton WhatsApp
- Panier de commande (FAB)
- QR code table (paramètre `?table=12`)

**Accès** : Public (sauf si subscription_status = expired)

### 10.3 Dashboard (`/dashboard`)

**KPIs** :
- Plats au menu
- Réservations
- Avis clients
- Forfait

**Alertes** :
- Essai gratuit (jours restants)
- Abonnement expiré
- Template non choisi

**Actions** :
- Copier URL publique
- Voir le site
- S'abonner

### 10.4 Menu (`/dashboard/menu`)

**Fonctionnalités** :
- CRUD plats
- Upload photo
- Limite par plan (5, 30, illimité)
- Catégories
- Disponibilité (visible/masqué)
- Tri par catégorie et position

### 10.5 Commandes (`/dashboard/commandes`)

**Fonctionnalités** :
- Liste en temps réel (Supabase Realtime)
- Filtres par statut
- Recherche (table, client, plat, notes)
- Filtres date (aujourd'hui, 7 jours)
- Tri (date, montant, statut)
- Pagination (20 par page)
- Actions :
  - Envoyer en cuisine
  - Marquer prêt
  - Marquer servi
  - Générer code paiement
  - Annuler
- Notification sonore nouvelle commande
- Toast avec numéro de table

### 10.6 Cuisine (`/dashboard/cuisine`)

**Fonctionnalités** :
- Vue par onglets (En attente, En cours, Prêts)
- Timer par commande (alerte à 10min, urgent à 15min)
- Actions :
  - Commencer préparation
  - Marquer prêt
  - Marquer servi
  - Annuler
- Notification sonore
- Compteurs par statut

### 10.7 Tables (`/dashboard/tables`)

**Fonctionnalités** :
- CRUD tables
- Statuts : Libre, Occupée, Réservée, Nettoyage
- Zones : Salle principale, Terrasse, VIP, Privé
- Filtres par statut et zone
- Actions rapides (occuper, réserver, libérer, nettoyage)
- KPIs par statut

### 10.8 Stocks (`/dashboard/stocks`)

**Fonctionnalités** :
- CRUD articles
- Catégories : Viandes, Poissons, Légumes, Fruits, Épicerie, Boissons, Produits laitiers, Condiments, Autres
- Unités : kg, g, L, mL, pièce, boîte, sachet, bouteille
- Alertes : OK, Bas, Critique
- Barre de progression visuelle
- +1 / -1 rapide
- Recherche et filtres

### 10.9 Statistiques (`/dashboard/statistiques`)

**Accès** : Premium uniquement  
**Fonctionnalités** :
- KPIs : Aujourd'hui, Cette semaine, Ce mois, Cette année
- Graphiques :
  - Évolution revenus (area chart)
  - Nombre commandes (bar chart)
  - Comparaison semaine (bar chart)
  - Top 5 articles (pie chart)
  - Heures de pointe (bar chart)
  - Revenus 7 jours (bar chart)
  - Ticket moyen (line chart)
- Conseil d'optimisation

### 10.10 Staff (`/dashboard/staff`)

**Accès** : Admin uniquement  
**Fonctionnalités** :
- CRUD membres
- Rôles : admin, cuisinier, serveur, manager
- PIN 4 chiffres (génération auto ou manuel)
- Activation/désactivation
- Affichage/masquage PIN
- Copie PIN
- Stats par rôle

### 10.11 Réservations (`/dashboard/reservations`)

**Fonctionnalités** :
- Liste triée par date/heure
- Statuts : En attente, Confirmée, Annulée
- Actions :
  - Confirmer
  - Envoyer WhatsApp confirmation
  - Envoyer rappel
  - Annuler
  - Supprimer

### 10.12 QR Code (`/dashboard/qr-code`)

**Fonctionnalités** :
- Génération QR code (PNG, SVG, Canvas)
- Personnalisation :
  - Taille (256-1024px)
  - Couleur
  - Fond
  - Marge
- Numéro de table (optionnel)
- Téléchargement
- Impression carte
- Copie lien
- Détection localhost (message d'avertissement)

### 10.13 Paramètres (`/dashboard/parametres`)

**Informations modifiables** :
- Nom du restaurant
- Ville
- Type de cuisine
- Nom du gérant
- Téléphone
- WhatsApp
- Adresse
- Horaires
- Description
- Canaux de notification (commandes, réservations)

### 10.14 Paiements (`/dashboard/paiements`)

**Fonctionnalités** :
- Historique codes de paiement
- Filtres : statut, moyen, recherche
- Configuration moyens de paiement :
  - Orange Money
  - Moov Money
  - Espèces
  - Wave
- Activation/désactivation
- Numéro et instructions
- Export CSV

### 10.15 Messagerie (`/dashboard/messaging`)

**Fonctionnalités** :
- Onglets : Réservations, Commandes impayées
- Actions :
  - Confirmer réservation (WhatsApp)
  - Rappel réservation
  - Rappel paiement
  - Message personnalisé
- Configuration requise : WhatsApp dans Paramètres

### 10.16 Galerie (`/dashboard/galerie`)

**Fonctionnalités** :
- Upload multiple photos
- Suppression
- Grille responsive
- Note : Fonctionnalité Premium (photos visibles en Premium)

### 10.17 Facturation (`/dashboard/facturation`)

**Accès** : Premium uniquement  
**Fonctionnalités** :
- CRUD factures
- Numérotation automatique
- Lignes multiples
- TVA configurable
- Téléchargement PDF
- Téléchargement Reçu
- Personnalisation couleurs
- Statuts : Impayé, Payé, Annulé
- Suppression

### 10.18 Chat (`/dashboard/chat`)

**Fonctionnalités** :
- Chat temps réel (Supabase Realtime)
- Messages par rôle (couleur)
- Auto-scroll
- Entrée pour envoyer
- Historique 100 messages

### 10.19 Avis (`/dashboard/avis`)

**Fonctionnalités** :
- Liste des avis
- Note moyenne
- Modération (approuver/masquer)
- Suppression
- Affichage note étoiles

### 10.20 Contenu (`/dashboard/contenu`)

**Fonctionnalités** :
- Upload logo (max 3Mo)
- Couleur principale
- Police d'écriture (6 options)
- Hero title/subtitle
- À propos
- Réseaux sociaux (Facebook, Instagram, TikTok)
- Préfixe facture
- Pied de page facture

### 10.21 Templates (`/dashboard/templates`)

**Fonctionnalités** :
- 9 templates (1 basique, 4 standard, 4 premium)
- Aperçu en grand (modal)
- Sélection
- Gating par plan
- Preview avec données démo

---

## 11. Composants

### 11.1 Composants UI (ShadCN)

Tous les composants ShadCN/ui sont disponibles dans `src/components/ui/` :
- Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip

**Composants personnalisés** :
- `Breadcrumbs` : Fil d'Ariane
- `ConfirmDialog` : Dialogue de confirmation
- `Modal` : Modal générique
- `ThemeToggle` : Bascule thème sombre/clair

### 11.2 Composants métier

#### `AuthShell`
Wrapper pour les pages d'authentification avec :
- Background animé (particules, gradient)
- Logo
- Titre et sous-titre
- Badge "Connexion sécurisée"
- Lien retour accueil

#### `OfflineBanner`
Bannière de statut hors ligne avec :
- Compteur d'actions en attente
- Animation de reconnexion
- Couleurs contextuelles (rouge hors ligne, bleu reconnexion, vert en ligne)

#### `StorageImage`
Composant pour afficher des images depuis Supabase Storage avec :
- URL signée
- Fallback
- Classes CSS personnalisables

#### `SubscribeContactModal`
Modal d'abonnement avec :
- Choix du plan
- Lien WhatsApp pour contact

#### `PaymentCodeModal`
Modal de génération de code de paiement avec :
- Sélection du moyen
- Montant
- Génération code

#### `InvoiceCustomizer`
Personnalisation des couleurs de facture avec :
- Color picker
- Preview

### 11.3 Composants landing

#### `Topbar`
Navigation principale avec :
- Logo
- Liens : Fonctionnalités, Tarifs, Avis, Connexion, Inscription
- Mobile responsive

#### `Footer`
Pied de page avec :
- Logo
- Description
- Liens rapides
- Contact
- Copyright

#### `Reveal`
Animation de scroll reveal

#### `Particles`
Particules flottantes décoratives

#### `Counter`
Compteur animé pour les stats

### 11.4 Composants publics

#### `shared.tsx`
Types et composants partagés pour les templates :
- `PublicRestaurant`, `PublicMenuItem`, `PublicReview`, `PublicGalleryImage`
- `Theme` : Interface de thème
- `buildWhatsAppLink` : Génération lien WhatsApp
- `groupByCategory` : Groupement menu par catégorie
- `fmtPrice` : Formatage prix FCFA
- `buildViewHref` : Navigation dans le template
- `avgRating` : Note moyenne
- `SectionHead` : En-tête de section
- `MenuGrid` : Grille de menu
- `GalleryGrid` : Grille galerie
- `ReviewList` : Liste d'avis
- `ReservationForm` : Formulaire de réservation
- `AdvancedReservationForm` : Formulaire avancé
- `ReviewForm` : Formulaire d'avis
- `FloatingWhatsApp` : Bouton WhatsApp flottant

#### `templates.tsx`
Rendu des templates avec :
- `TplMarche` : Template Marché (vert/orange)
- `TplClassique` : Template Classique (noir/blanc)
- Autres templates importés

#### `premium-templates.tsx`
Templates premium :
- `TplPremiumFeu`
- `TplPremiumLuxe`
- `TplPremiumNuit`
- `TplPremiumRoyal`

#### `OrderCart.tsx`
Panier de commande flottant

#### `OrderTracking.tsx`
Suivi de commande

### 11.5 Composants dashboard

#### `Placeholder.tsx`
Composant de placeholder pour pages en construction

---

## 12. Hooks personnalisés

### 12.1 `use-auth.ts`
Gestion de l'authentification :
- Écoute `onAuthStateChange`
- Récupère la session
- Retourne `{ session, user, loading }`

### 12.2 `use-debounce.ts`
Debounce de valeur (délai 300ms par défaut) :
- Utilisé pour la recherche en temps réel

### 12.3 `use-is-super-admin.ts`
Vérification rôle super admin :
- Interroge `user_roles`
- Retourne `{ isSuperAdmin, loading }`

### 12.4 `use-my-restaurant.ts`
Récupération du restaurant de l'utilisateur :
- Jointure avec `auth.users`
- Retourne `{ restaurant, loading, refresh }`

### 12.5 `use-realtime.ts`
Abonnement temps réel Supabase :
- Générique pour toute table
- Callbacks : `onInsert`, `onUpdate`, `onDelete`
- Gestion automatique du canal

### 12.6 `use-staff-role.ts`
Vérification du rôle staff :
- Lit `sessionStorage`
- Retourne `{ staff, isAdmin, loading }`

### 12.7 `use-theme.ts`
Gestion du thème (dark/light) :
- Bascule classe `dark` sur `<html>`
- Persistance dans `localStorage`

---

## 13. Types et interfaces

### 13.1 Commandes
```typescript
type OrderStatus = "new" | "in_kitchen" | "ready" | "served" | "paid" | "cancelled";
interface Order { id, restaurant_id, table_number, customer_name, customer_phone, items, total, status, source, notes, created_at, whatsapp_sent_at }
interface OrderItem { name, price, qty }
```

### 13.2 Stocks
```typescript
interface StockItem { id, name, category, current_quantity, min_quantity, unit, last_restock, status }
type StockStatus = "ok" | "low" | "critical";
```

### 13.3 Staff
```typescript
type StaffRole = "admin" | "cuisinier" | "serveur" | "manager";
interface StaffMember { id, restaurant_id, user_id, name, email, phone, role, pin, is_active, permissions, created_at }
```

### 13.4 Tables
```typescript
type TableStatus = "free" | "occupied" | "reserved" | "cleaning";
interface RestaurantTable { id, restaurant_id, number, capacity, zone, status, position }
```

### 13.5 Chat
```typescript
interface ChatMessage { id, restaurant_id, sender_name, sender_role, message, created_at, read }
```

### 13.6 Restaurant
```typescript
interface Restaurant { id, name, slug, plan, template, city, user_id? }
interface MyRestaurant { /* étendu avec tous les champs */ }
```

### 13.7 Public
```typescript
interface PublicRestaurant { id, name, city, cuisine, description, address, hours, phone, whatsapp, email, plan, template, logo_url }
interface PublicMenuItem { id, category, name, description, price, image_url, available }
interface PublicReview { id, author_name, rating, comment, created_at }
interface PublicGalleryImage { id, image_url, caption }
interface Theme { bg, surface, surfaceAlt, text, textMuted, accent, accentInk, border, radius }
```

### 13.8 Utilitaires
```typescript
type PlanType = "free" | "premium" | "sur_mesure";
function isPremium(plan?: string): boolean
function formatCurrency(n: number): string
function formatDate(dateStr: string): string
function formatRelativeTime(dateStr: string): string
```

---

## 14. Système de design

### 14.1 Palette de couleurs

**Couleurs principales** :
- `--gold` : #d4a853 (or principal)
- `--gold-light` : #f0d48a (or clair)
- `--gold-dark` : #b08800 (or foncé)
- `--dark` : #0a0a0f (fond principal)
- `--dark-card` : #111118 (cartes)
- `--dark-card-hover` : #1a1a24 (survol cartes)

**Couleurs sémantiques** :
- `--background` : #0a0a0f
- `--foreground` : #e8e6e3
- `--primary` : #d4a853
- `--primary-foreground` : #0a0a0f
- `--secondary` : #1a1a24
- `--muted` : #1a1a24
- `--muted-foreground` : #8b8a88
- `--accent` : rgba(212,168,83,0.12)
- `--destructive` : #ef4444
- `--border` : rgba(255,255,255,0.08)

### 14.2 Gradients

- `--gradient-gold` : linear-gradient(135deg, #d4a853, #f0d48a, #b08800)
- `--gradient-dark` : linear-gradient(180deg, #0a0a0f 0%, #111118 100%)

### 14.3 Ombres

- `--shadow-gold` : 0 8px 30px rgba(212,168,83,0.35)
- `--shadow-card` : 0 25px 60px rgba(0,0,0,0.5)

### 14.4 Typographie

- **Font display** : 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif
- **Fonts templates** : Inter, Playfair Display, Cormorant Garamond, Poppins, Montserrat, DM Serif Display

### 14.5 Animations

- `reveal-up` : Apparition depuis le bas
- `float-particle` : Particules flottantes
- `grid-drift` : Grille animée
- `logo-pulse` : Pulsation logo
- `shimmer` : Effet de brillance
- `slide-up` : Modal slide-up
- `tpl-bg-drift` : Background template animé

### 14.6 Utilities CSS

- `.text-gradient-gold` : Texte avec gradient doré
- `.bg-gradient-gold` : Fond avec gradient doré
- `.shadow-gold` : Ombre dorée
- `.glass-card` : Carte glassmorphism
- `.grid-bg` : Grille de fond animée
- `.particle` : Particule décorative

### 14.7 Responsive

- Mobile-first
- Breakpoints : sm (640px), md (768px), lg (1024px), xl (1280px)
- Optimisations iOS :
  - Safe areas
  - Désactivation zoom inputs
  - Touch action manipulation
  - Backdrop filter optimisé

---

## 15. Templates publics

### 15.1 Templates disponibles

| ID | Nom | Plan | Description |
|----|-----|------|-------------|
| `gratuit-classique` | Classique | Basique | Swiss minimal noir/blanc |
| `std-soleil` | Soleil | Standard | Éditorial chaleureux crème |
| `std-savane` | Savane | Standard | Ocre & rust africain |
| `std-marche` | Marché | Standard | Couleurs vives Sankariaré |
| `std-moderne` | Moderne | Standard | Épuré contemporain |
| `prem-royal` | Palais Royal | Premium | Or, QR, cave, événements |
| `prem-nuit` | Aurum Nuit | Premium | Fine dining sombre animé |
| `prem-feu` | Ignis Feu | Premium | Braises animées & grillades |
| `prem-luxe` | Luxe Grill | Premium | Grande réservation + QR |

### 15.2 Structure d'un template

Chaque template inclut :
- **Navigation** : sticky header avec logo et liens
- **Home** : Hero, stats, features, menu preview, reviews preview, CTA
- **Menu** : Grille de plats par catégorie
- **About** : Histoire, pourquoi nous choisir
- **Reserve** : Formulaire de réservation avancé
- **Galerie** : Grille masonry
- **Avis** : Liste + formulaire
- **Footer** : Coordonnées, horaires, contact, WhatsApp CTA
- **Floating WhatsApp** : Bouton flottant

### 15.3 Thèmes

Chaque template a son propre thème :
```typescript
interface Theme {
  bg: string;          // Couleur de fond
  surface: string;     // Surface des cartes
  surfaceAlt: string;  // Surface alternative
  text: string;        // Couleur de texte
  textMuted: string;   // Texte secondaire
  accent: string;      // Couleur d'accent
  accentInk: string;   // Couleur de texte sur accent
  border: string;      // Couleur de bordure
  radius: string;      // Border radius
}
```

---

## 16. Intégrations externes

### 16.1 Supabase

**Services utilisés** :
- **Auth** : Email/mot de passe, Google OAuth
- **Database** : PostgreSQL avec RLS
- **Storage** : Upload images (menu, galerie, logo)
- **Realtime** : WebSockets pour commandes et chat
- **Edge Functions** : Envoi d'emails 2FA

### 16.2 WhatsApp

**Utilisations** :
- Commandes automatiques (pré-rempli)
- Confirmations de réservation
- Rappels de réservation
- Rappels de paiement
- Messages personnalisés
- Support client

**Format** : `https://wa.me/{phone}?text={message}`

### 16.3 Resend (Email)

**Utilisation** : Envoi du code 2FA pour super admin  
**Edge Function** : `send-2fa-email`

### 16.4 Google Fonts

**Fonts utilisées** :
- Inter (UI)
- Playfair Display (templates)
- Cormorant Garamond (templates)
- Poppins (templates)
- Montserrat (templates)
- DM Serif Display (templates)
- Bebas Neue (templates)
- Archivo Black (templates)
- Space Grotesk (templates)

---

## 17. PWA et offline

### 17.1 Service Worker

**Fichier** : `sw.js`  
**Configuration** : `vite-plugin-pwa` avec Workbox

**Fonctionnalités** :
- Precache des assets
- Cache stratégies (stale-while-revalidate)
- Support hors ligne
- Installation PWA

### 17.2 Manifest

**Fichier** : `public/manifest.webmanifest`  
**Configuration** :
- Nom : Resto BF
- Icônes
- Theme color : #0a0a0f
- Display : standalone
- Orientation : any

### 17.3 Page hors ligne

**Route** : `/offline`  
**Fonctionnalités** :
- Message hors ligne
- Liste des fonctionnalités disponibles hors ligne
- Bouton réessayer

### 17.4 Bannière hors ligne

**Composant** : `OfflineBanner`  
**Fonctionnalités** :
- Détection automatique online/offline
- Compteur d'actions en attente
- Animation de reconnexion

---

## 18. Déploiement

### 18.1 Plateformes supportées

- **Vercel** (recommandé)
- **Netlify**
- **Cloudflare Pages**
- **Self-hosted** (Nginx + Node.js)

### 18.2 Variables d'environnement

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# App
VITE_APP_URL=
```

### 18.3 Build

```bash
npm run build        # Build production
npm run build:dev    # Build développement
npm run preview      # Preview build
npm run dev          # Serveur développement
```

### 18.4 Configuration Nitro

**Fichier** : `vite.config.ts`  
**Target** : Cloudflare (par défaut)  
**Server entry** : `src/server.ts`

---

## 19. Sécurité

### 19.1 Authentification

- JWT Supabase (signature HMAC-SHA256)
- Refresh tokens automatiques
- Déconnexion automatique après inactivité

### 19.2 Row Level Security

Toutes les tables sensibles ont des politiques RLS :
- `restaurants` : Accès par `user_id`
- `menu_items` : Accès par `restaurant_id`
- `orders` : Accès par `restaurant_id`
- `staff_members` : Accès par `restaurant_id`
- etc.

### 19.3 Validation

- **Zod** pour validation des formulaires
- **React Hook Form** pour gestion des erreurs
- Sanitization des inputs

### 19.4 2FA Super Admin

- Mot de passe + code PIN 6 chiffres
- Envoi par email (Resend)
- Stockage en session (pas de cookie)

### 19.5 CORS

Configuration CORS dans Supabase pour autoriser uniquement les domaines autorisés.

### 19.6 Rate limiting

Rate limiting sur les routes sensibles (inscription, connexion).

---

## 20. Performance

### 20.1 Optimisations frontend

- **Code splitting** : Routes chargées à la demande
- **Lazy loading** : Images, composants
- **Memoization** : `useMemo`, `useCallback`
- **Debounce** : Recherche, inputs
- **Virtual scrolling** : Listes longues
- **Image optimization** : WebP, lazy loading, responsive images

### 20.2 Optimisations backend

- **Indexes** : Sur toutes les FK et champs filtrés
- **RLS** : Filtrage au niveau DB
- **Realtime** : Canaux ciblés (par restaurant)
- **Cache** : TanStack Query (5min stale time)

### 20.3 Métriques cibles

- **LCP** : < 2.5s
- **FID** : < 100ms
- **CLS** : < 0.1
- **TTI** : < 3.8s

---

## 21. Migrations SQL

### 21.1 Liste des migrations

1. `20240630_add_public_site_url.sql` — Ajout colonne URL publique
2. `20240701_add_invoice_colors.sql` — Couleurs factures
3. `20240701_add_invoice_fields.sql` — Champs factures
4. `20240701_add_staff_pin.sql` — PIN staff
5. `20240701_add_staff_roles.sql` — Rôles staff
6. `20240701_add_stock_management.sql` — Gestion stocks
7. `20260101000000_create_payment_codes.sql` — Codes paiement
8. `20260102000000_create_payment_methods.sql` — Moyens paiement
9. `20260612123734_69dca205-03b9-4b7c-bd65-d096866a0a20.sql` — Migration initiale
10. `20260612132651_a2f5797c-66d1-486f-888b-fdb42d509015.sql`
11. `20260612132715_d662c858-3ed5-4845-99b5-1f2a7dd0a9ad.sql`
12. `20260613115014_b2efa60c-c4fe-497b-a508-517a4da49092.sql`
13. `20260613115027_6117c595-fbc9-4c05-bc0a-1961564375a4.sql`
14. `20260614140340_544d6ab0-8310-452e-8ea6-a9050e214934.sql`
15. `20260619003424_8cc843c2-56f1-4204-9503-c34ba4adb36e.sql`
16. `20260619100432_7d9e1f99-ebc4-489f-bbc2-9b3ae128fffd.sql`
17. `20260621054150_24f1fbce-a896-4a1a-8788-83ba5430f8aa.sql`
18. `20260621061344_d4e378eb-24e9-47d1-9dc8-432125f44b48.sql`
19. `...` (autres migrations)

### 21.2 Application des migrations

```bash
# Via Supabase CLI
supabase migration up

# Via dashboard Supabase
# SQL Editor → Coller le contenu de la migration
```

---

## 22. Guides et documentation

### 22.1 Guides disponibles

- `APPLIQUER_MIGRATIONS.md` — Guide d'application des migrations
- `AUTH_SETUP.md` — Configuration authentification
- `GUIDE_2FA_EMAIL.md` — Configuration 2FA email
- `GUIDE_ACCES_CUISINIER.md` — Accès cuisinier
- `GUIDE_CUISINIER.md` — Guide cuisinier
- `DEPLOYMENT.md` — Guide de déploiement
- `TESTING.md` — Guide de tests
- `VERIFIER_RLS.md` — Vérification RLS

### 22.2 Scripts utilitaires

- `fix-plans.js` — Correction des plans
- `run-fix.cjs` — Exécution des corrections

---

## 23. Évolutions prévues

### 23.1 Fonctionnalités futures

- **Campagnes WhatsApp** : Envoi groupé de promotions
- **Programme de fidélité** : Carte de fidélité digitale
- **Avis Google** : Intégration avis Google
- **Planning staff** : Gestion des horaires
- **Fournisseurs** : Gestion des fournisseurs
- **Rapports mensuels** : Génération automatique PDF
- **Export données** : CSV, Excel
- **Domaine personnalisé** : Pour Premium
- **Mode néon** : Thème néon
- **Mode jour** : Thème clair

### 23.2 Améliorations techniques

- **SSR** : Activer SSR pour meilleur SEO
- **i18n** : Internationalisation
- **Tests** : Jest, React Testing Library, Playwright
- **CI/CD** : GitHub Actions
- **Monitoring** : Sentry, LogRocket
- **Analytics** : Plausible, Mixpanel

---

## 24. Maintenance

### 24.1 Tâches régulières

- **Quotidien** : Vérifier les logs d'erreur
- **Hebdomadaire** : Vérifier les migrations
- **Mensuel** : Mettre à jour les dépendances
- **Trimestriel** : Audit de sécurité

### 24.2 Support

- **WhatsApp** : +226 55 30 08 68
- **Email** : support@restobf.bf
- **Documentation** : Guides dans le repo

---

## 25. Conclusion

Resto BF est une application SaaS complète et mature pour les restaurants au Burkina Faso. Elle combine :

- ✅ **Fonctionnalités complètes** : Menu, commandes, réservations, stocks, facturation, statistiques
- ✅ **Multi-plans** : Gratuit, Basique, Standard, Premium, Sur mesure
- ✅ **Multi-rôles** : Admin, Manager, Cuisinier, Serveur
- ✅ **Templates modernes** : 9 templates avec thèmes personnalisables
- ✅ **PWA** : Fonctionne hors ligne
- ✅ **Temps réel** : Commandes et chat en direct
- ✅ **WhatsApp** : Intégration complète
- ✅ **PDF** : Factures et reçus
- ✅ **QR Code** : Génération personnalisable
- ✅ **Sécurité** : RLS, 2FA, validation
- ✅ **Performance** : Optimisé pour mobile

Le projet est prêt pour la production et peut être déployé sur Vercel, Netlify ou Cloudflare Pages.

---

**Fin du cahier de conception**