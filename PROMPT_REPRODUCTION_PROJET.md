# PROMPT ULTRA-DÉTAILLÉ — Reproduction Complète du Projet Resto BF

**Niveau** : Senior Full-Stack Developer  
**Objectif** : Reproduire le projet Resto BF à 98-100% de fidélité  
**Stack autorisée** : React, TypeScript, Supabase, Tailwind CSS, TanStack Router/Query  
**Durée estimée** : 80-120 heures de développement

---

## 🎯 MISSION PRINCIPALE

Tu es un développeur senior expert en React/TypeScript/Supabase. Ta mission est de **reproduire intégralement** le projet **Resto BF**, un SaaS complet pour restaurants au Burkina Faso, en suivant ce cahier des charges ultra-précis.

**Résultat attendu** : Une application 100% fonctionnelle, identique à l'originale, prête pour la production.

---

## 📋 CONTEXTE PROJET

### Vision
Resto BF est un SaaS (Software as a Service) permettant à des restaurants, maquis et fast-foods au Burkina Faso de créer en 5 minutes un site web professionnel avec menu digital, commandes WhatsApp, réservations en ligne, gestion des tables, espace cuisine temps réel, statistiques avancées, facturation PDF, et bien plus.

### Cible
- Restaurants, maquis, fast-foods au Burkina Faso
- Langue : Français
- Monnaie : FCFA (Franc CFA)
- Paiements : Orange Money, Moov Money, Wave, Espèces
- Support : WhatsApp 7j/7

### Valeurs
- 100% Burkina
- Installation en 5 minutes
- Sans carte bancaire pour l'essai
- Annulation à tout moment
- Pas de commission sur les ventes

---

## 🛠️ STACK TECHNIQUE EXACTE

### Frontend (OBLIGATOIRE)
```
React 19.2.0
TypeScript 5.8.3
Vite 8.0.16
TanStack Router 1.168.25 (file-based routing)
TanStack Query 5.83.0 (cache/état serveur)
TanStack Start 1.167.50 (SSR/SSG - optionnel, SSR désactivé par défaut)
Tailwind CSS 4.2.1
ShadCN/ui (tous les composants)
Radix UI (primitives)
Lucide React 0.575.0 (icônes)
Recharts 2.15.4 (graphiques)
jsPDF 4.2.1 + jspdf-autotable (PDF)
QRCode 1.5.4 (QR codes)
Sonner 2.0.7 (toasts)
React Hook Form 7.71.2 + Zod 3.24.2 (formulaires/validation)
date-fns 4.1.0 (dates)
Embla Carousel 8.6.0 (carousel)
Vaul 1.1.2 (drawer)
CMDK 1.1.1 (command palette)
Input OTP 1.4.2 (PIN)
```

### Backend (OBLIGATOIRE)
```
Supabase 2.108.1 (BaaS)
PostgreSQL (base de données)
Supabase Auth (authentification)
Supabase Storage (fichiers)
Supabase Realtime (WebSockets)
Supabase Edge Functions (serverless)
```

### Outils (OBLIGATOIRE)
```
ESLint (linting)
Prettier (formatage)
Nitro (server runtime)
Workbox (service worker)
Vite PWA (PWA)
```

### Variables d'environnement (EXACTES)
```env
VITE_SUPABASE_URL=***
VITE_SUPABASE_ANON_KEY=***
VITE_APP_URL=***
```

---

## 🗄️ BASE DE DONNÉES — SCHÉMA COMPLET

### Tables à créer (SQL exact)

#### 1. `restaurants` (TABLE CENTRALE)
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'basique', 'standard', 'premium', 'sur_mesure')),
  template TEXT,
  city TEXT,
  cuisine TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  hours TEXT,
  description TEXT,
  owner_name TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  logo_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  about_text TEXT,
  primary_color TEXT DEFAULT '#c9a14a',
  font_family TEXT DEFAULT 'Inter',
  sections JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  invoice_prefix TEXT DEFAULT 'FACT',
  invoice_footer TEXT,
  public_site_url TEXT,
  notification_orders_channel TEXT DEFAULT 'both' CHECK (notification_orders_channel IN ('admin', 'whatsapp', 'both')),
  notification_reservations_channel TEXT DEFAULT 'both' CHECK (notification_reservations_channel IN ('admin', 'whatsapp', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_plan ON restaurants(plan);

-- RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own restaurant"
  ON restaurants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own restaurant"
  ON restaurants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own restaurant"
  ON restaurants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own restaurant"
  ON restaurants FOR DELETE
  USING (user_id = auth.uid());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_restaurants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_updated_at();
```

#### 2. `menu_items`
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage menu items"
  ON menu_items FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_updated_at();
```

#### 3. `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_kitchen', 'ready', 'served', 'paid', 'cancelled')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('qr', 'whatsapp', 'manual')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  whatsapp_sent_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage orders"
  ON orders FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );
```

#### 4. `reservations`
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage reservations"
  ON reservations FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

-- Public can insert reservations
CREATE POLICY "Public can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (true);
```

#### 5. `reviews`
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_approved ON reviews(approved);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage reviews"
  ON reviews FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (approved = true);
```

#### 6. `gallery_images`
```sql
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_images_restaurant_id ON gallery_images(restaurant_id);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage gallery"
  ON gallery_images FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view gallery"
  ON gallery_images FOR SELECT
  USING (true);
```

#### 7. `staff_members`
```sql
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'cuisinier' CHECK (role IN ('admin', 'cuisinier', 'serveur', 'manager')),
  pin TEXT,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_members_restaurant_id ON staff_members(restaurant_id);
CREATE INDEX idx_staff_members_role ON staff_members(role);

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage staff"
  ON staff_members FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_updated_at();
```

#### 8. `restaurant_tables`
```sql
CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  zone TEXT,
  status TEXT DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'cleaning')),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);

ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage tables"
  ON restaurant_tables FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );
```

#### 9. `stock_items`
```sql
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pièce',
  last_restock TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ok' CHECK (status IN ('ok', 'low', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_items_restaurant_id ON stock_items(restaurant_id);
CREATE INDEX idx_stock_items_category ON stock_items(category);

ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage stock"
  ON stock_items FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE TRIGGER update_stock_items_updated_at
  BEFORE UPDATE ON stock_items
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_updated_at();
```

#### 10. `invoices`
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 18,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'cancelled')),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  notes TEXT,
  payment_method TEXT,
  table_number TEXT,
  waiter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_restaurant_id ON invoices(restaurant_id);
CREATE INDEX idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage invoices"
  ON invoices FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );
```

#### 11. `payment_codes`
```sql
CREATE TABLE payment_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('orange_money', 'moov_money', 'cash', 'wave')),
  amount DECIMAL(10,2),
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_codes_order_id ON payment_codes(order_id);

ALTER TABLE payment_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage payment codes"
  ON payment_codes FOR ALL
  USING (
    order_id IN (
      SELECT id FROM orders WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE user_id = auth.uid()
      )
    )
  );
```

#### 12. `payment_methods`
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  icon TEXT,
  phone_number TEXT,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_restaurant_id ON payment_methods(restaurant_id);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage payment methods"
  ON payment_methods FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_updated_at();
```

#### 13. `chat_messages`
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_restaurant_id ON chat_messages(restaurant_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant staff can manage chat"
  ON chat_messages FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE user_id = auth.uid()
    )
  );
```

#### 14. `user_roles` (Super Admin)
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());
```

#### 15. `plan_features`
```sql
CREATE TABLE plan_features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  plans JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTD DEFAULT NOW()
);

ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan features"
  ON plan_features FOR SELECT
  USING (true);
```

#### 16. `custom_orders` (Leads)
```sql
CREATE TABLE custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert custom orders"
  ON custom_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Super admins can manage custom orders"
  ON custom_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );
```

### Vue publique
```sql
CREATE VIEW public_restaurants AS
SELECT 
  id, name, slug, city, cuisine, description, address, hours,
  phone, whatsapp, logo_url, template, subscription_status,
  plan, primary_color, font_family, social_links
FROM restaurants
WHERE subscription_status != 'expired';
```

---

## 🎨 DESIGN SYSTEM COMPLET

### Couleurs (CSS Variables exactes)
```css
:root {
  /* Brand */
  --gold: #d4a853;
  --gold-light: #f0d48a;
  --gold-dark: #b08800;
  --dark: #0a0a0f;
  --dark-card: #111118;
  --dark-card-hover: #1a1a24;
  
  /* Semantic */
  --background: #0a0a0f;
  --foreground: #e8e6e3;
  --card: #111118;
  --card-foreground: #e8e6e3;
  --popover: #111118;
  --popover-foreground: #e8e6e3;
  --primary: #d4a853;
  --primary-foreground: #0a0a0f;
  --secondary: #1a1a24;
  --secondary-foreground: #e8e6e3;
  --muted: #1a1a24;
  --muted-foreground: #8b8a88;
  --accent: rgba(212,168,83,0.12);
  --accent-foreground: #f0d48a;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: rgba(255,255,255,0.08);
  --input: rgba(255,255,255,0.08);
  --ring: #d4a853;
  
  /* Gradients */
  --gradient-gold: linear-gradient(135deg, #d4a853, #f0d48a, #b08800);
  --gradient-dark: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);
  
  /* Shadows */
  --shadow-gold: 0 8px 30px rgba(212,168,83,0.35);
  --shadow-card: 0 25px 60px rgba(0,0,0,0.5);
  
  /* Radius */
  --radius: 0.75rem;
}
```

### Typographie
```
Font display: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif
Fonts templates: Inter, Playfair Display, Cormorant Garamond, Poppins, Montserrat, DM Serif Display
```

### Animations CSS
```css
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
}

@keyframes grid-drift {
  0% { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}

@keyframes logo-pulse {
  0%, 100% { filter: drop-shadow(0 4px 12px rgba(212,168,83,0.3)); }
  50% { filter: drop-shadow(0 4px 24px rgba(212,168,83,0.6)); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes tpl-bg-drift {
  0% { transform: scale(1.08) translate3d(-1.5%,0,0); }
  100% { transform: scale(1.18) translate3d(1.5%,-1.5%,0); }
}
```

### Utilities CSS personnalisées
```css
.text-gradient-gold {
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bg-gradient-gold {
  background: var(--gradient-gold);
}

.shadow-gold {
  box-shadow: var(--shadow-gold);
}

.glass-card {
  background: var(--dark-card);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
}

.grid-bg {
  background-image:
    linear-gradient(rgba(212,168,83,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,168,83,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: grid-drift 25s linear infinite;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--gold);
  border-radius: 50%;
  opacity: 0.4;
  animation: float-particle 8s ease-in-out infinite;
}
```

### Responsive Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Optimisations iOS/Mobile
```css
@media (max-width: 768px) {
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  
  input, textarea, select {
    font-size: 16px !important; /* Empêche le zoom iOS */
    border-radius: 12px;
    -webkit-appearance: none;
  }
  
  button, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
  
  .tpl-bg img {
    animation: none;
    transform: scale(1.05);
  }
}
```

---

## 📁 STRUCTURE DU PROJET (ARBORESCENCE COMPLÈTE)

```
resto-bf-saas/
├── .env.example
├── .gitignore
├── .prettierrc
├── AGENTS.md
├── APPLIQUER_MIGRATIONS.md
├── AUTH_SETUP.md
├── bun.lock
├── bunfig.toml
├── components.json
├── DEPLOYMENT.md
├── eslint.config.js
├── fix-plans.js
├── GUIDE_2FA_EMAIL.md
├── GUIDE_ACCES_CUISINIER.md
├── GUIDE_CUISINIER.md
├── package.json
├── package-lock.json
├── run-fix.cjs
├── sw.js
├── TESTING.md
├── tsconfig.json
├── VERIFIER_RLS.md
├── vite.config.ts
├── public/
│   ├── bg-marché.jpg
│   ├── bg-moderne.jpg
│   ├── bg-saas.jpg
│   ├── bg-savane.jpg
│   ├── bg-soleil.webp
│   ├── manifest.webmanifest
│   ├── restobf-logo.png
│   ├── icons/
│   └── premium-bgs/
│       ├── premium-feu-bg.png
│       ├── premium-grill-bg.png
│       ├── premium-orange-bg.png
│       └── premium-pasta-bg.png
└── src/
    ├── router.tsx
    ├── routeTree.gen.ts
    ├── server.ts
    ├── start.ts
    ├── styles.css
    ├── theme.css
    ├── assets/
    ├── components/
    │   ├── InvoiceCustomizer.tsx
    │   ├── OfflineBanner.tsx
    │   ├── StorageImage.tsx
    │   ├── SubscribeContactModal.tsx
    │   ├── admin/
    │   │   └── PaymentCodeModal.tsx
    │   ├── auth/
    │   │   └── AuthShell.tsx
    │   ├── dashboard/
    │   │   └── Placeholder.tsx
    │   ├── invoices/
    │   │   └── InvoiceBuilder.tsx
    │   ├── landing/
    │   │   ├── Counter.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Particles.tsx
    │   │   ├── Reveal.tsx
    │   │   └── Topbar.tsx
    │   ├── public/
    │   │   ├── demo-data.ts
    │   │   ├── OrderCart.tsx
    │   │   ├── OrderTracking.tsx
    │   │   ├── premium-templates.tsx
    │   │   ├── shared.tsx
    │   │   ├── templates.tsx
    │   │   └── templates/
    │   │       ├── tpl-nuit.tsx
    │   │       ├── tpl-soleil.tsx
    │   │       ├── tpl-savane.tsx
    │   │       └── tpl-moderne.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── Breadcrumbs.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── ConfirmDialog.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── Modal.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── ThemeToggle.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       └── tooltip.tsx
    ├── hooks/
    │   ├── use-auth.ts
    │   ├── use-debounce.ts
    │   ├── use-is-super-admin.ts
    │   ├── use-my-restaurant.ts
    │   ├── use-realtime.ts
    │   ├── use-staff-role.ts
    │   └── use-theme.ts
    ├── integrations/
    │   └── supabase/
    │       └── client.ts
    ├── lib/
    │   ├── lovable-error-reporting.ts
    │   ├── pwa.ts
    │   ├── site-url.ts
    │   ├── storage.ts
    │   ├── validation.ts
    │   └── invoice-templates.ts
    ├── routes/
    │   ├── __root.tsx
    │   ├── index.tsx
    │   ├── debug-user.tsx
    │   ├── offline.tsx
    │   ├── r.$slug.tsx
    │   ├── super-admin.tsx
    │   ├── _authenticated/
    │   │   ├── route.tsx
    │   │   ├── dashboard.tsx
    │   │   ├── dashboard.index.tsx
    │   │   ├── dashboard.menu.tsx
    │   │   ├── dashboard.commandes.tsx
    │   │   ├── dashboard.cuisine.tsx
    │   │   ├── dashboard.tables.tsx
    │   │   ├── dashboard.stocks.tsx
    │   │   ├── dashboard.statistiques.tsx
    │   │   ├── dashboard.staff.tsx
    │   │   ├── dashboard.reservations.tsx
    │   │   ├── dashboard.qr-code.tsx
    │   │   ├── dashboard.parametres.tsx
    │   │   ├── dashboard.paiements.tsx
    │   │   ├── dashboard.messaging.tsx
    │   │   ├── dashboard.menu.tsx
    │   │   ├── dashboard.galerie.tsx
    │   │   ├── dashboard.facturation.tsx
    │   │   ├── dashboard.chat.tsx
    │   │   ├── dashboard.avis.tsx
    │   │   ├── dashboard.contenu.tsx
    │   │   ├── dashboard.templates.tsx
    │   │   └── dashboard.commandes.tsx
    │   └── auth/
    │       ├── index.tsx
    │       ├── connexion.tsx
    │       ├── inscription.tsx
    │       ├── callback.tsx
    │       ├── choisir-template.tsx
    │       ├── abonnement.tsx
    │       └── staff-login.tsx
    ├── styles/
    ├── types/
    │   └── index.ts
    └── theme.css
└── supabase/
    ├── config.toml
    ├── fix-has-role.sql
    ├── functions/
    │   └── send-2fa-email/
    │       └── index.ts
    └── migrations/
        ├── 20240630_add_public_site_url.sql
        ├── 20240701_add_invoice_colors.sql
        ├── 20240701_add_invoice_fields.sql
        ├── 20240701_add_staff_pin.sql
        ├── 20240701_add_staff_roles.sql
        ├── 20240701_add_stock_management.sql
        ├── 20260101000000_create_payment_codes.sql
        ├── 20260102000000_create_payment_methods.sql
        └── ... (toutes les autres migrations)
```

---

## 🔐 AUTHENTIFICATION & SÉCURITÉ

### 1. Authentification restaurateur
- **Email + Mot de passe** (Supabase Auth)
- **Google OAuth**
- Session JWT avec refresh automatique
- Déconnexion après inactivité

### 2. Authentification staff
- **Nom + PIN 4 chiffres**
- Stockage dans sessionStorage (pas de JWT)
- Accès simplifié

### 3. Super Admin
- Mot de passe: `admin-1-2-3`
- Code 2FA envoyé par email (Resend)
- Vérification rôle dans `user_roles`

### 4. Row Level Security (RLS)
- Toutes les tables ont des politiques RLS
- Les restaurateurs ne voient que leurs données
- Le public voit seulement les données publiées

---

## 👥 SYSTÈME DE RÔLES

### Rôles utilisateur
```typescript
type StaffRole = "admin" | "cuisinier" | "serveur" | "manager";
type UserRole = "super_admin" | "admin" | "manager" | "cuisinier" | "serveur";
```

### Permissions par rôle
- **admin** : Accès complet au dashboard
- **manager** : Aperçu, Commandes, Cuisine, Stocks, Statistiques, Chat
- **cuisinier** : Cuisine, Commandes, Stocks, Chat
- **serveur** : Commandes, Tables, Chat
- **super_admin** : Accès à /super-admin

### Navigation adaptative
Le layout dashboard (`dashboard.tsx`) doit adapter les menus selon le rôle de l'utilisateur.

---

## 💰 PLANS D'ABONNEMENT

### Plans disponibles
```typescript
type Plan = "trial" | "basique" | "standard" | "premium" | "sur_mesure";

const PLANS = {
  trial: { price: 0, duration: 30, features: [] },
  basique: { price: 5000, features: ["template_basique", "10_plats"] },
  standard: { price: 10000, features: ["4_templates", "30_plats"] },
  premium: { price: 15000, features: ["templates_animes", "illimite", "statistiques", "facturation"] },
  sur_mesure: { price: 250000, features: ["tout", "personnalisation"] }
};
```

### Feature Gating
Vérifier le plan dans les composants:
```typescript
const isPremium = restaurant?.plan === "premium" || restaurant?.plan === "sur_mesure";
const isStandard = ["standard", "premium", "sur_mesure"].includes(restaurant?.plan);
```

---

## 🛣️ ROUTES À IMPLÉMENTER

### Routes publiques
```
/ → Landing page
/r/$slug → Restaurant public
/auth/ → Choix espace
/auth/connexion → Connexion
/auth/inscription → Inscription
/auth/callback → Callback OAuth
/auth/choisir-template → Choix template
/auth/abonnement → Abonnement basique
/auth/staff-login → Connexion staff
/offline → Page hors ligne
/super-admin → Super administration
/debug-user → Debug (dev)
```

### Routes authentifiées
```
/dashboard → Aperçu
/dashboard/menu → Gestion menu
/dashboard/commandes → Commandes en direct
/dashboard/cuisine → Espace cuisine
/dashboard/tables → Gestion tables
/dashboard/stocks → Gestion stocks
/dashboard/statistiques → Statistiques (Premium)
/dashboard/staff → Gestion personnel (admin)
/dashboard/reservations → Réservations
/dashboard/qr-code → QR Code
/dashboard/parametres → Paramètres
/dashboard/paiements → Paiements
/dashboard/messaging → Messagerie WhatsApp
/dashboard/galerie → Galerie photos
/dashboard/facturation → Facturation (Premium)
/dashboard/chat → Chat interne
/dashboard/avis → Avis clients
/dashboard/contenu → Contenu & branding
/dashboard/templates → Templates
```

---

## 📱 FONCTIONNALITÉS PAR PAGE (DÉTAIL COMPLET)

### Landing Page (`/`)
**Sections**:
1. Hero avec aperçu dashboard
2. Stats: 50+ restaurants, 5 templates, 4.9★, 24/7
3. Templates disponibles (5 cartes)
4. Fonctionnalités (6 cartes)
5. Pourquoi Resto BF (8 cartes)
6. Témoignages (3 avis)
7. Tarifs (3 plans + sur mesure)
8. FAQ (6 questions)
9. CTA WhatsApp

**Fonctionnalités**:
- Scroll reveal animations
- Modal sélection plan
- Liens inscription avec paramètre `plan`

### Restaurant Public (`/r/$slug`)
**Fonctionnalités**:
- Affichage template choisi
- Menu digital par catégorie
- Galerie photos (masonry)
- Avis clients (avec modération)
- Formulaire réservation avancé
- Bouton WhatsApp flottant
- Panier commande (FAB)
- QR code table (`?table=12`)

**Accès**: Public (sauf subscription_status = expired)

### Dashboard (`/dashboard`)
**KPIs**:
- Plats au menu
- Réservations
- Avis clients
- Forfait actuel

**Alertes**:
- Essai gratuit (jours restants)
- Abonnement expiré
- Template non choisi

**Actions**:
- Copier URL publique
- Voir le site
- S'abonner

### Menu (`/dashboard/menu`)
**Fonctionnalités**:
- CRUD plats (Create, Read, Update, Delete)
- Upload photo (max 5MB)
- Limite par plan (5, 30, illimité)
- Catégories personnalisables
- Disponibilité (visible/masqué)
- Tri par catégorie et position
- Recherche

### Commandes (`/dashboard/commandes`)
**Fonctionnalités**:
- Liste en temps réel (Supabase Realtime)
- Filtres par statut (tous, nouveaux, en cuisine, prêts, servis, payés)
- Recherche (table, client, plat, notes)
- Filtres date (aujourd'hui, 7 jours)
- Tri (date, montant, statut)
- Pagination (20 par page)
- Actions:
  - Envoyer en cuisine
  - Marquer prêt
  - Marquer servi
  - Générer code paiement
  - Annuler
- Notification sonore nouvelle commande
- Toast avec numéro de table

### Cuisine (`/dashboard/cuisine`)
**Fonctionnalités**:
- Vue par onglets (En attente, En cours, Prêts)
- Timer par commande (alerte à 10min, urgent à 15min)
- Actions:
  - Commencer préparation
  - Marquer prêt
  - Marquer servi
  - Annuler
- Notification sonore
- Compteurs par statut

### Tables (`/dashboard/tables`)
**Fonctionnalités**:
- CRUD tables
- Statuts: Libre, Occupée, Réservée, Nettoyage
- Zones: Salle principale, Terrasse, VIP, Privé
- Filtres par statut et zone
- Actions rapides (occuper, réserver, libérer, nettoyage)
- KPIs par statut

### Stocks (`/dashboard/stocks`)
**Fonctionnalités**:
- CRUD articles
- Catégories: Viandes, Poissons, Légumes, Fruits, Épicerie, Boissons, Produits laitiers, Condiments, Autres
- Unités: kg, g, L, mL, pièce, boîte, sachet, bouteille
- Alertes: OK, Bas, Critique
- Barre de progression visuelle
- +1 / -1 rapide
- Recherche et filtres

### Statistiques (`/dashboard/statistiques`)
**Accès**: Premium uniquement  
**Fonctionnalités**:
- KPIs: Aujourd'hui, Cette semaine, Ce mois, Cette année
- Graphiques:
  - Évolution revenus (area chart)
  - Nombre commandes (bar chart)
  - Comparaison semaine (bar chart)
  - Top 5 articles (pie chart)
  - Heures de pointe (bar chart)
  - Revenus 7 jours (bar chart)
  - Ticket moyen (line chart)
- Conseil d'optimisation

### Staff (`/dashboard/staff`)
**Accès**: Admin uniquement  
**Fonctionnalités**:
- CRUD membres
- Rôles: admin, cuisinier, serveur, manager
- PIN 4 chiffres (génération auto ou manuel)
- Activation/désactivation
- Affichage/masquage PIN
- Copie PIN
- Stats par rôle

### Réservations (`/dashboard/reservations`)
**Fonctionnalités**:
- Liste triée par date/heure
- Statuts: En attente, Confirmée, Annulée
- Actions:
  - Confirmer
  - Envoyer WhatsApp confirmation
  - Envoyer rappel
  - Annuler
  - Supprimer

### QR Code (`/dashboard/qr-code`)
**Fonctionnalités**:
- Génération QR code (PNG, SVG, Canvas)
- Personnalisation:
  - Taille (256-1024px)
  - Couleur
  - Fond
  - Marge
- Numéro de table (optionnel)
- Téléchargement
- Impression carte
- Copie lien
- Détection localhost (message d'avertissement)

### Paramètres (`/dashboard/parametres`)
**Informations modifiables**:
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

### Paiements (`/dashboard/paiements`)
**Fonctionnalités**:
- Historique codes de paiement
- Filtres: statut, moyen, recherche
- Configuration moyens de paiement:
  - Orange Money
  - Moov Money
  - Espèces
  - Wave
- Activation/désactivation
- Numéro et instructions
- Export CSV

### Messagerie (`/dashboard/messaging`)
**Fonctionnalités**:
- Onglets: Réservations, Commandes impayées
- Actions:
  - Confirmer réservation (WhatsApp)
  - Rappel réservation
  - Rappel paiement
  - Message personnalisé
- Configuration requise: WhatsApp dans Paramètres

### Galerie (`/dashboard/galerie`)
**Fonctionnalités**:
- Upload multiple photos
- Suppression
- Grille responsive
- Note: Fonctionnalité Premium (photos visibles en Premium)

### Facturation (`/dashboard/facturation`)
**Accès**: Premium uniquement  
**Fonctionnalités**:
- CRUD factures
- Numérotation automatique
- Lignes multiples
- TVA configurable
- Téléchargement PDF
- Téléchargement Reçu
- Personnalisation couleurs
- Statuts: Impayé, Payé, Annulé
- Suppression

### Chat (`/dashboard/chat`)
**Fonctionnalités**:
- Chat temps réel (Supabase Realtime)
- Messages par rôle (couleur)
- Auto-scroll
- Entrée pour envoyer
- Historique 100 messages

### Avis (`/dashboard/avis`)
**Fonctionnalités**:
- Liste des avis
- Note moyenne
- Modération (approuver/masquer)
- Suppression
- Affichage note étoiles

### Contenu (`/dashboard/contenu`)
**Fonctionnalités**:
- Upload logo (max 3Mo)
- Couleur principale
- Police d'écriture (6 options)
- Hero title/subtitle
- À propos
- Réseaux sociaux (Facebook, Instagram, TikTok)
- Préfixe facture
- Pied de page facture

### Templates (`/dashboard/templates`)
**Fonctionnalités**:
- 9 templates (1 basique, 4 standard, 4 premium)
- Aperçu en grand (modal)
- Sélection
- Gating par plan
- Preview avec données démo

---

## 🎭 TEMPLATES PUBLICS

### Templates disponibles
```
1. gratui-classique (Basique) - Swiss minimal noir/blanc
2. std-soleil (Standard) - Éditorial chaleureux crème
3. std-savane (Standard) - Ocre & rust africain
4. std-marche (Standard) - Couleurs vives Sankariaré
5. std-moderne (Standard) - Épuré contemporain
6. prem-royal (Premium) - Or, QR, cave, événements
7. prem-nuit (Premium) - Fine dining sombre animé
8. prem-feu (Premium) - Braises animées & grillades
9. prem-luxe (Premium) - Grande réservation + QR
```

### Structure d'un template
Chaque template doit inclure:
- **Navigation**: sticky header avec logo et liens
- **Home**: Hero, stats, features, menu preview, reviews preview, CTA
- **Menu**: Grille de plats par catégorie
- **About**: Histoire, pourquoi nous choisir
- **Reserve**: Formulaire de réservation avancé
- **Galerie**: Grille masonry
- **Avis**: Liste + formulaire
- **Footer**: Coordonnées, horaires, contact, WhatsApp CTA
- **Floating WhatsApp**: Bouton flottant

### Thème template
```typescript
interface Theme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  accentInk: string;
  border: string;
  radius: string;
}
```

---

## 🔌 INTÉGRATIONS EXTERNES

### 1. Supabase
- **Auth**: Email/mot de passe, Google OAuth
- **Database**: PostgreSQL avec RLS
- **Storage**: Upload images (menu, galerie, logo)
- **Realtime**: WebSockets pour commandes et chat
- **Edge Functions**: Envoi d'emails 2FA

### 2. WhatsApp
- Commandes automatiques (pré-rempli)
- Confirmations de réservation
- Rappels de réservation
- Rappels de paiement
- Messages personnalisés
- Support client

**Format**: `https://wa.me/{phone}?text={message}`

### 3. Resend (Email)
- Envoi du code 2FA pour super admin
- Edge Function: `send-2fa-email`

### 4. Google Fonts
- Inter (UI)
- Playfair Display (templates)
- Cormorant Garamond (templates)
- Poppins (templates)
- Montserrat (templates)
- DM Serif Display (templates)

---

## 📦 PWA & OFFLINE

### Service Worker
- Fichier: `sw.js`
- Configuration: `vite-plugin-pwa` avec Workbox
- Precache des assets
- Cache stratégies (stale-while-revalidate)
- Support hors ligne
- Installation PWA

### Manifest
- Fichier: `public/manifest.webmanifest`
- Nom: Resto BF
- Icônes
- Theme color: #0a0a0f
- Display: standalone
- Orientation: any

### Page hors ligne
- Route: `/offline`
- Message hors ligne
- Liste fonctionnalités disponibles hors ligne
- Bouton réessayer

### Bannière hors ligne
- Composant: `OfflineBanner`
- Détection automatique online/offline
- Compteur d'actions en attente
- Animation de reconnexion

---

## 🚀 DÉPLOIEMENT

### Plateformes supportées
- Vercel (recommandé)
- Netlify
- Cloudflare Pages
- Self-hosted (Nginx + Node.js)

### Build
```bash
npm install
npm run dev          # Serveur développement
npm run build        # Build production
npm run preview      # Preview build
```

### Configuration Nitro
- Target: Cloudflare (par défaut)
- Server entry: `src/server.ts`

---

## ✅ CHECKLIST DE VALIDATION (98-100%)

### Base de données
- [ ] Toutes les 16 tables créées avec bons schémas
- [ ] Toutes les policies RLS fonctionnelles
- [ ] Toutes les indexes créés
- [ ] Vue `public_restaurants` fonctionnelle
- [ ] Triggers `updated_at` sur toutes les tables

### Authentification
- [ ] Inscription email/mot de passe
- [ ] Connexion Google OAuth
- [ ] Connexion staff (nom + PIN)
- [ ] Super admin (mot de passe + 2FA email)
- [ ] Sessions JWT avec refresh automatique
- [ ] Déconnexion automatique après inactivité

### Routes
- [ ] Toutes les 30+ routes fonctionnelles
- [ ] Routage file-based avec TanStack Router
- [ ] Layout authentifié avec navigation adaptative
- [ ] Guards de route (admin, premium, auth)

### Pages
- [ ] Landing page complète (9 sections)
- [ ] Restaurant public avec template
- [ ] Dashboard avec KPIs
- [ ] Menu (CRUD complet)
- [ ] Commandes (temps réel)
- [ ] Cuisine (vue par onglets)
- [ ] Tables (CRUD + statuts)
- [ ] Stocks (CRUD + alertes)
- [ ] Statistiques (7 graphiques)
- [ ] Staff (CRUD + PIN)
- [ ] Réservations (CRUD + WhatsApp)
- [ ] QR Code (génération + personnalisation)
- [ ] Paramètres (édition restaurant)
- [ ] Paiements (historique + config)
- [ ] Messagerie (WhatsApp)
- [ ] Galerie (upload + grille)
- [ ] Facturation (PDF + reçus)
- [ ] Chat (temps réel)
- [ ] Avis (modération)
- [ ] Contenu (branding)
- [ ] Templates (9 templates + preview)

### Composants
- [ ] Tous les composants ShadCN/ui
- [ ] AuthShell
- [ ] OfflineBanner
- [ ] StorageImage
- [ ] PaymentCodeModal
- [ ] InvoiceCustomizer
- [ ] Tous les composants landing
- [ ] Tous les composants publics (shared, templates)
- [ ] Tous les composants dashboard

### Fonctionnalités
- [ ] Menu digital avec catégories
- [ ] Commandes WhatsApp automatiques
- [ ] Réservations en ligne
- [ ] Gestion tables avec statuts
- [ ] Stocks avec alertes
- [ ] Statistiques avancées (Premium)
- [ ] Facturation PDF avec templates
- [ ] Galerie photos
- [ ] Avis clients avec modération
- [ ] Chat interne temps réel
- [ ] Messagerie WhatsApp
- [ ] QR Code personnalisable
- [ ] Gestion staff avec rôles
- [ ] Paiements multiples (Orange Money, Moov Money, Wave, Espèces)
- [ ] Notifications (admin, WhatsApp, both)

### Design
- [ ] Design system complet (couleurs, gradients, shadows)
- [ ] Typographie (6 fonts)
- [ ] Animations (7 animations)
- [ ] Utilities CSS personnalisées
- [ ] Responsive mobile-first
- [ ] Optimisations iOS

### Templates
- [ ] 9 templates fonctionnels
- [ ] Chaque template avec home, menu, about, reserve, galerie, avis
- [ ] Thèmes personnalisés par template
- [ ] Floating WhatsApp
- [ ] Navigation sticky

### Performance
- [ ] Code splitting (routes)
- [ ] Lazy loading images
- [ ] Debounce recherche
- [ ] Memoization (useMemo, useCallback)
- [ ] TanStack Query cache (5min stale time)
- [ ] Images optimisées (WebP, lazy loading)

### PWA
- [ ] Service Worker fonctionnel
- [ ] Manifest configuré
- [ ] Page hors ligne
- [ ] Bannière hors ligne
- [ ] Installation PWA

### Sécurité
- [ ] RLS sur toutes les tables
- [ ] Validation Zod sur tous les formulaires
- [ ] Sanitization inputs
- [ ] 2FA super admin
- [ ] CORS configuré
- [ ] Rate limiting

---

## 🎯 CRITÈRES DE SUCCÈS

### Minimum acceptable: 98%
- Toutes les tables et RLS fonctionnelles
- Authentification complète (restaurateur + staff + super admin)
- 21 pages dashboard fonctionnelles
- 9 templates publics fonctionnels
- Toutes les fonctionnalités CRUD
- Temps réel (commandes + chat)
- WhatsApp intégré
- PDF fonctionnel
- PWA fonctionnelle
- Design system respecté
- Responsive mobile

### Objectif idéal: 100%
- Identique à l'original en termes de fonctionnalités
- Code propre et maintenable
- Performance optimale
- Sécurité maximale
- Documentation complète

---

## 📝 INSTRUCTIONS FINALES

### Ce que tu DOIS faire:
1. **Analyser** ce cahier des charges en détail
2. **Créer** la structure du projet exacte
3. **Implémenter** toutes les tables SQL avec RLS
4. **Développer** toutes les routes et pages
5. **Créer** tous les composants
6. **Intégrer** Supabase (Auth, Database, Storage, Realtime)
7. **Implémenter** le design system exact
8. **Créer** les 9 templates publics
9. **Configurer** la PWA
10. **Tester** toutes les fonctionnalités

### Ce que tu NE DOIS PAS faire:
- ❌ Modifier la stack technique
- ❌ Oublier des fonctionnalités
- ❌ Ignorer le design system
- ❌ Négliger la sécurité (RLS)
- ❌ Oublier le responsive mobile
- ❌ Ignorer les performances

### Livrable final:
1. **Code source complet** du projet
2. **Fichier SQL** avec toutes les tables, indexes, policies, triggers
3. **Variables d'environnement** template (.env.example)
4. **README.md** avec instructions d'installation et de déploiement
5. **Documentation** de l'architecture et des fonctionnalités

---

## 🚨 POINTS CRITIQUES À NE PAS MANQUER

1. **RLS OBLIGATOIRE** sur toutes les tables sensibles
2. **PIN 4 chiffres** pour le staff (génération auto ou manuel)
3. **WhatsApp** intégré partout où c'est nécessaire
4. **Templates Premium** accessibles uniquement aux plans premium/sur_mesure
5. **Statistiques** réservées au plan premium
6. **Facturation PDF** réservée au plan premium
7. **Chat temps réel** avec Supabase Realtime
8. **Notifications sonores** pour nouvelles commandes
9. **Timer** dans l'espace cuisine (alertes 10min, 15min)
10. **QR Code** personnalisable (couleur, fond, taille, marge)
11. **PWA** fonctionnelle hors ligne
12. **Responsive** mobile-first avec optimisations iOS
13. **Design system** respecté (couleurs or, dark theme)
14. **Animations** fluides (reveal, particles, etc.)
15. **Performance** optimisée (code splitting, lazy loading, cache)

---

## 📚 RÉFÉRENCES

### Fichiers de référence dans le projet:
- `CAHIER_DE_CONCEPTION.md` - Cahier de conception complet
- `src/types/index.ts` - Tous les types TypeScript
- `src/styles.css` - Design system complet
- `supabase/migrations/` - Toutes les migrations SQL
- `src/routes/` - Toutes les routes
- `src/components/` - Tous les composants

### Documentation externe:
- Supabase: https://supabase.com/docs
- TanStack Router: https://tanstack.com/router
- TanStack Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com/docs
- ShadCN/ui: https://ui.shadcn.com
- Recharts: https://recharts.org
- jsPDF: https://github.com/parallax/jsPDF

---

## 🎓 NIVEAU D'EXPERTISE REQUIS

### Senior Full-Stack Developer avec:
- ✅ 5+ ans d'expérience React/TypeScript
- ✅ Maîtrise Supabase (Auth, Database, Storage, Realtime)
- ✅ Expertise Tailwind CSS et design systems
- ✅ Connaissance approfondie TanStack Router/Query
- ✅ Expérience PWA et offline-first
- ✅ Maîtrise PostgreSQL et RLS
- ✅ Intégrations API tierces (WhatsApp, Google OAuth)
- ✅ Performance optimization (code splitting, lazy loading, caching)
- ✅ Sécurité (RLS, validation, sanitization)
- ✅ Mobile-first et responsive design
- ✅ PDF generation (jsPDF)
- ✅ Real-time applications (WebSockets)

---

## ⚡ COMMENCE MAINTENANT

1. **Lis** ce prompt en entier
2. **Analyse** chaque section
3. **Planifie** l'architecture
4. **Implémente** dans l'ordre:
   - Base de données (SQL)
   - Configuration (Supabase, Vite, Tailwind)
   - Hooks personnalisés
   - Composants UI
   - Composants métier
   - Routes et pages
   - Templates publics
   - PWA
   - Tests
5. **Vérifie** contre la checklist 98-100%
6. **Livr**e le code complet

**Rappel**: Tu dois reproduire ce projet à 98-100% de fidélité. Chaque fonctionnalité compte. Chaque détail du design system compte. Chaque ligne de SQL compte.

**Bonne chance! 🚀**

---

**Fin du prompt**