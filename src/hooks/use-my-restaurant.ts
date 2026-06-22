import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MyRestaurant = {
  id: string;
  name: string;
  slug: string | null;
  plan: string;
  template: string | null;
  city: string;
  cuisine: string | null;
  phone: string;
  whatsapp: string | null;
  email: string;
  address: string | null;
  hours: string | null;
  description: string | null;
  owner_name: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  logo_url: string | null;
};

export function useMyRestaurant() {
  const [restaurant, setRestaurant] = useState<MyRestaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("restaurants")
      .select("id, name, slug, plan, template, city, cuisine, phone, whatsapp, email, address, hours, description, owner_name, subscription_status, trial_ends_at, subscription_ends_at, logo_url")
      .eq("user_id", u.user.id)
      .maybeSingle();
    if (data) setRestaurant(data as MyRestaurant);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { restaurant, loading, refresh };
}
