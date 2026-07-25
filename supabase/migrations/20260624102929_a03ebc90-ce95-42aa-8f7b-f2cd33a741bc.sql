
-- Tables
CREATE TABLE public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  number text NOT NULL,
  capacity int NOT NULL DEFAULT 2,
  zone text,
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free','occupied','reserved','cleaning')),
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, number)
);

GRANT SELECT ON public.restaurant_tables TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_tables TO authenticated;
GRANT ALL ON public.restaurant_tables TO service_role;

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read tables" ON public.restaurant_tables
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owner manages tables" ON public.restaurant_tables
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));

CREATE POLICY "Super admin reads all tables" ON public.restaurant_tables
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_restaurant_tables_updated BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id uuid REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  table_number text,
  customer_name text,
  customer_phone text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_kitchen','ready','served','paid','cancelled')),
  source text NOT NULL DEFAULT 'qr' CHECK (source IN ('qr','whatsapp','manual','phone')),
  whatsapp_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can create orders" ON public.orders
  FOR INSERT TO anon WITH CHECK (
    restaurant_id IS NOT NULL
    AND status = 'new'
    AND source IN ('qr','whatsapp')
    AND jsonb_typeof(items) = 'array'
    AND jsonb_array_length(items) BETWEEN 1 AND 50
  );

CREATE POLICY "Owner reads orders" ON public.orders
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));

CREATE POLICY "Owner updates orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));

CREATE POLICY "Owner inserts orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));

CREATE POLICY "Owner deletes orders" ON public.orders
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));

CREATE POLICY "Super admin reads orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_orders_restaurant_status ON public.orders (restaurant_id, status, created_at DESC);
CREATE INDEX idx_orders_table ON public.orders (table_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;

-- Public site URL on restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS public_site_url text;
