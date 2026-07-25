
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
CREATE TRIGGER restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
