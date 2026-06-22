
-- 0. Replace plan check constraint to accept new values
ALTER TABLE public.restaurants DROP CONSTRAINT IF EXISTS restaurants_plan_check;
ALTER TABLE public.restaurants
  ADD CONSTRAINT restaurants_plan_check
  CHECK (plan IN ('trial','standard','standard_plus','premium','sur_mesure','gratuit'));

-- 1. Add columns
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS hero_title text,
  ADD COLUMN IF NOT EXISTS hero_subtitle text,
  ADD COLUMN IF NOT EXISTS about_text text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS font_family text,
  ADD COLUMN IF NOT EXISTS sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS invoice_prefix text,
  ADD COLUMN IF NOT EXISTS invoice_footer text;

-- 2. Migrate existing "gratuit" rows to trial
UPDATE public.restaurants
  SET plan = 'trial',
      trial_ends_at = COALESCE(trial_ends_at, created_at + interval '14 days'),
      subscription_status = CASE
        WHEN COALESCE(trial_ends_at, created_at + interval '14 days') > now() THEN 'trial'
        ELSE 'expired'
      END
  WHERE plan = 'gratuit';

UPDATE public.restaurants
  SET trial_ends_at = COALESCE(trial_ends_at, created_at + interval '14 days')
  WHERE trial_ends_at IS NULL;

-- 3. Signup trigger now starts everyone on trial
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
  v_slug := trim(both '-' from v_slug) || '-' || substr(md5(random()::text), 1, 4);

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
    NEW.email, 'trial', 'trial', now() + interval '14 days'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 4. Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  customer_address text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'unpaid',
  issued_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, invoice_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages invoices" ON public.invoices;
CREATE POLICY "Owner manages invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = invoices.restaurant_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = invoices.restaurant_id AND r.user_id = auth.uid()));

DROP POLICY IF EXISTS "Super admins read all invoices" ON public.invoices;
CREATE POLICY "Super admins read all invoices" ON public.invoices
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Custom orders
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text,
  budget text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_orders TO authenticated;
GRANT INSERT ON public.custom_orders TO anon;
GRANT ALL ON public.custom_orders TO service_role;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit custom order" ON public.custom_orders;
CREATE POLICY "Anyone can submit custom order" ON public.custom_orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Super admins read custom orders" ON public.custom_orders;
CREATE POLICY "Super admins read custom orders" ON public.custom_orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins update custom orders" ON public.custom_orders;
CREATE POLICY "Super admins update custom orders" ON public.custom_orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
