
-- Menu items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'Plats',
  name text NOT NULL,
  description text,
  price integer NOT NULL DEFAULT 0,
  image_url text,
  available boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Owner manages menu_items" ON public.menu_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));
CREATE TRIGGER set_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reservations
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  party_size integer NOT NULL DEFAULT 2,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reservations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create reservation" ON public.reservations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owner views reservations" ON public.reservations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));
CREATE POLICY "Owner updates reservations" ON public.reservations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));
CREATE POLICY "Owner deletes reservations" ON public.reservations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));
CREATE TRIGGER set_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees approved reviews" ON public.reviews FOR SELECT USING (approved = true);
CREATE POLICY "Owner sees all reviews" ON public.reviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));
CREATE POLICY "Anyone can submit review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owner updates reviews" ON public.reviews FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));
CREATE POLICY "Owner deletes reviews" ON public.reviews FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));

-- Gallery
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees gallery" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Owner manages gallery" ON public.gallery_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.user_id = auth.uid()));

-- Trigger for restaurants updated_at (if not exists)
DROP TRIGGER IF EXISTS set_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER set_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
