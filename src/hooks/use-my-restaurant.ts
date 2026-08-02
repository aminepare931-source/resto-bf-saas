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
  public_site_url?: string | null;
  notification_orders_channel?: string | null;
  notification_reservations_channel?: string | null;
};

export function useMyRestaurant() {
  const [restaurant, setRestaurant] = useState<MyRestaurant | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("restobf_current_restaurant");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    let userEmail = "";
    let userId = "";
    let userMeta: Record<string, any> = {};

    try {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        userEmail = u.user.email || "";
        userId = u.user.id || "";
        userMeta = u.user.user_metadata || {};
      }
    } catch (e) {
      // ignore
    }

    // Si pas d'utilisateur connecté, ne pas continuer
    if (!userId) {
      setLoading(false);
      return;
    }

    // Try fetching from Supabase
    const savedTemplate = typeof window !== "undefined" ? localStorage.getItem("restobf_selected_template") : null;

    try {
      const { data } = await supabase
        .from("restaurants")
        .select(
          "id, name, slug, plan, template, city, cuisine, phone, whatsapp, email, address, hours, description, owner_name, subscription_status, trial_ends_at, subscription_ends_at, logo_url, public_site_url, notification_orders_channel, notification_reservations_channel",
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        const restData = {
          ...data,
          template: (savedTemplate || data.template || "prem-royal") as string,
        };
        setRestaurant(restData as MyRestaurant);
        localStorage.setItem("restobf_current_restaurant", JSON.stringify(restData));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Supabase fetch restaurant error", err);
    }

    // If no restaurant row found in DB, construct a default populated restaurant so the dashboard is complete
    const defaultRestaurant: MyRestaurant = {
      id: userId,
      name: userMeta.restaurant_name || "Le Maquis RestoBF",
      slug: (userMeta.restaurant_name || "maquis-resto-bf")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      plan: userMeta.plan || "standard",
      template: savedTemplate || userMeta.template || "prem-royal",
      city: userMeta.city || "Ouagadougou",
      cuisine: userMeta.cuisine || "Maquis & Grillades Burkinabè",
      phone: userMeta.phone || "+226 70 00 00 00",
      whatsapp: userMeta.phone || "+226 70 00 00 00",
      email: userEmail,
      address: "Avenue Kwame N'Krumah, Ouagadougou, Burkina Faso",
      hours: "11h00 - 23h30 (7j/7)",
      description:
        "Le meilleur de la gastronomie locale : poulet bicyclette, capitaine du Niger grillé, tô et rafraîchissements.",
      owner_name: userMeta.owner_name || userEmail.split("@")[0] || "Amine Paré",
      subscription_status: "trial",
      trial_ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      subscription_ends_at: null,
      logo_url: null,
      public_site_url: null,
      notification_orders_channel: "whatsapp",
      notification_reservations_channel: "whatsapp",
    };

    // Attempt to save to Supabase
    try {
      const { data: inserted } = await supabase
        .from("restaurants")
        .insert({
          user_id: userId,
          name: defaultRestaurant.name,
          slug: defaultRestaurant.slug,
          plan: defaultRestaurant.plan,
          template: defaultRestaurant.template,
          city: defaultRestaurant.city,
          cuisine: defaultRestaurant.cuisine,
          phone: defaultRestaurant.phone,
          whatsapp: defaultRestaurant.whatsapp,
          email: defaultRestaurant.email,
          address: defaultRestaurant.address,
          hours: defaultRestaurant.hours,
          description: defaultRestaurant.description,
          owner_name: defaultRestaurant.owner_name,
          subscription_status: defaultRestaurant.subscription_status,
          trial_ends_at: defaultRestaurant.trial_ends_at,
        })
        .select()
        .maybeSingle();

      if (inserted) {
        const finalRest = inserted as MyRestaurant;
        setRestaurant(finalRest);
        localStorage.setItem("restobf_current_restaurant", JSON.stringify(finalRest));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Could not insert default restaurant to Supabase", e);
    }

    setRestaurant(defaultRestaurant);
    localStorage.setItem("restobf_current_restaurant", JSON.stringify(defaultRestaurant));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { restaurant, loading, refresh };
}
