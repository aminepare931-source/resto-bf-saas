CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  city TEXT NOT NULL,
  cuisine TEXT,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'standard' CHECK (plan IN ('gratuit','standard','premium')),
  template TEXT,
  description TEXT,
  address TEXT,
  hours TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT SELECT ON public.restaurants TO anon;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view restaurants" ON public.restaurants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owner can insert own restaurant" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update own restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete own restaurant" ON public.restaurants FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER set_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

DROP POLICY IF EXISTS "Public read restaurant-media" ON storage.objects;
DROP POLICY IF EXISTS "Owner upload restaurant-media" ON storage.objects;
DROP POLICY IF EXISTS "Owner update restaurant-media" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete restaurant-media" ON storage.objects;

CREATE POLICY "Public read restaurant-media" ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-media');
CREATE POLICY "Owner upload restaurant-media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'restaurant-media' AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id::text = (storage.foldername(name))[1] AND r.user_id = auth.uid()));
CREATE POLICY "Owner update restaurant-media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'restaurant-media' AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id::text = (storage.foldername(name))[1] AND r.user_id = auth.uid()));
CREATE POLICY "Owner delete restaurant-media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'restaurant-media' AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id::text = (storage.foldername(name))[1] AND r.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_restaurant_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    user_id, name, slug, city, cuisine, owner_name, phone, whatsapp, email, plan
  ) VALUES (
    NEW.id,
    v_name,
    v_slug,
    COALESCE(meta->>'city', ''),
    meta->>'cuisine',
    COALESCE(meta->>'owner_name', ''),
    COALESCE(meta->>'phone', ''),
    regexp_replace(COALESCE(meta->>'phone',''), '\s|\+', '', 'g'),
    NEW.email,
    COALESCE(meta->>'plan', 'standard')
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_restaurant ON auth.users;
CREATE TRIGGER on_auth_user_created_restaurant
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_restaurant_user();
REVOKE EXECUTE ON FUNCTION public.handle_new_restaurant_user() FROM PUBLIC, anon, authenticated;

CREATE TYPE public.app_role AS ENUM ('super_admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE OR REPLACE FUNCTION public.claim_super_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_exists boolean; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') INTO v_exists;
  IF v_exists THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'super_admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin')
$$;
REVOKE ALL ON FUNCTION public.super_admin_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.super_admin_exists() TO authenticated, anon;

CREATE POLICY "Super admins read all restaurants" ON public.restaurants FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins update all restaurants" ON public.restaurants FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins read all reservations" ON public.reservations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins read all reviews" ON public.reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
