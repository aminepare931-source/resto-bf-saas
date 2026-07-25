import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { renderTemplate } from "@/components/public/templates";
import type {
  PublicRestaurant,
  PublicMenuItem,
  PublicReview,
  PublicGalleryImage,
} from "@/components/public/shared";
import { OrderCartFab } from "@/components/public/OrderCart";
import { CartProvider } from "@/components/public/CartContext";
import { demoData } from "@/components/public/demo-data";

export const Route = createFileRoute("/r/$slug")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    table: typeof s.table === "string" ? s.table.slice(0, 10) : undefined,
    view: typeof s.view === "string" ? s.view.slice(0, 20) : undefined,
    tpl: typeof s.tpl === "string" ? s.tpl.slice(0, 30) : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Resto BF` },
      {
        name: "description",
        content: "Découvrez ce restaurant : menu, photos, avis, réservation et commande en ligne.",
      },
    ],
  }),
  component: PublicRestaurantPage,
});

function humanizeSlug(slug: string): string {
  if (!slug || slug === "demo") return "Le Baobab Doré";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function PublicRestaurantPage() {
  const { slug } = Route.useParams();
  const { table, view, tpl } = Route.useSearch();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(() => {
    // Check local storage for instant initial render
    if (typeof window !== "undefined") {
      const selectedTpl = tpl || localStorage.getItem("restobf_selected_template");
      const cached = localStorage.getItem("restobf_current_restaurant");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed) {
            return {
              ...parsed,
              template: selectedTpl || parsed.template || "prem-royal",
              plan: "premium",
            };
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  });

  const [menu, setMenu] = useState<PublicMenuItem[]>(demoData.menu);
  const [reviews, setReviews] = useState<PublicReview[]>(demoData.reviews);
  const [gallery, setGallery] = useState<PublicGalleryImage[]>(demoData.gallery);
  const [loading, setLoading] = useState(!restaurant);

  // Sync template changes from localStorage & custom events instantly
  useEffect(() => {
    const syncLocal = () => {
      const selectedTpl = tpl || localStorage.getItem("restobf_selected_template");
      const cached = localStorage.getItem("restobf_current_restaurant");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed) {
            setRestaurant((prev) => ({
              ...(prev || parsed),
              ...parsed,
              template: selectedTpl || parsed.template || prev?.template || "prem-royal",
              plan: "premium",
            }));
            return;
          }
        } catch (e) {
          // ignore
        }
      }
      if (selectedTpl) {
        setRestaurant((prev) => prev ? { ...prev, template: selectedTpl } : prev);
      }
    };

    window.addEventListener("storage", syncLocal);
    window.addEventListener("template-changed", syncLocal);
    return () => {
      window.removeEventListener("storage", syncLocal);
      window.removeEventListener("template-changed", syncLocal);
    };
  }, [tpl]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      let rRaw: any = null;

      // Timeout wrapper to guarantee page renders under 1 second
      const withTimeout = <T,>(promise: Promise<T>, timeoutMs = 800): Promise<T | null> => {
        return Promise.race([
          promise,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
        ]);
      };

      try {
        const queryPromise = supabase
          .from("public_restaurants" as never)
          .select(
            "id, name, city, cuisine, description, address, hours, phone, whatsapp, logo_url, template, subscription_status, offers_delivery",
          )
          .eq("slug", slug)
          .maybeSingle()
          .then((res) => res.data);

        rRaw = await withTimeout(queryPromise, 900);

        if (!rRaw) {
          // Retry directly on restaurants table
          const fallbackQuery = supabase
            .from("restaurants")
            .select(
              "id, name, city, cuisine, description, address, hours, phone, whatsapp, logo_url, template",
            )
            .eq("slug", slug)
            .maybeSingle()
            .then((res) => res.data);

          rRaw = await withTimeout(fallbackQuery, 700);
        }
      } catch (err) {
        console.warn("Supabase query error:", err);
      }

      if (!isMounted) return;

      const storedTpl = typeof window !== "undefined" ? localStorage.getItem("restobf_selected_template") : null;
      const activeTpl = tpl || storedTpl || rRaw?.template || "prem-royal";

      if (rRaw) {
        setRestaurant((prev) => ({
          ...rRaw,
          template: activeTpl,
          email: prev?.email || "",
          plan: "premium",
        }));

        // Fetch menu, reviews, gallery in parallel with timeout
        try {
          const fetchDetails = Promise.all([
            supabase
              .from("menu_items")
              .select("id, category, name, description, price, image_url, available")
              .eq("restaurant_id", rRaw.id)
              .eq("available", true)
              .order("category")
              .order("position"),
            supabase
              .from("reviews")
              .select("id, author_name, rating, comment, created_at")
              .eq("restaurant_id", rRaw.id)
              .eq("approved", true)
              .order("created_at", { ascending: false })
              .limit(12),
            supabase
              .from("gallery_images")
              .select("id, image_url, caption")
              .eq("restaurant_id", rRaw.id)
              .order("position"),
          ]);

          const res = await withTimeout(fetchDetails, 1000);
          if (res && isMounted) {
            const [m, rev, g] = res;
            const menuItems = (m.data ?? []) as PublicMenuItem[];
            const reviewItems = (rev.data ?? []) as PublicReview[];
            const galleryItems = (g.data ?? []) as PublicGalleryImage[];

            if (menuItems.length > 0) setMenu(menuItems);
            if (reviewItems.length > 0) setReviews(reviewItems);
            if (galleryItems.length > 0) setGallery(galleryItems);
          }
        } catch (e) {
          console.warn("Details fetch error:", e);
        }
      } else {
        // Fallback: Generate a rich, authentic demo site for this slug with activeTpl
        const fallbackName = humanizeSlug(slug);

        setRestaurant((prev) => ({
          id: prev?.id || `demo-${slug}`,
          name: prev?.name || fallbackName,
          city: prev?.city || "Ouagadougou",
          cuisine: prev?.cuisine || "Cuisine burkinabè & grillades au feu de bois",
          description: prev?.description || `Bienvenue chez ${fallbackName} ! Découvrez notre carte gastronomique, nos spécialités grillées au feu de bois, notre service traiteur et nos espaces événements.`,
          address: prev?.address || "Secteur 4, Avenue Kwame N'Krumah, Ouagadougou",
          hours: prev?.hours || "Lundi — Dimanche · 11h00 — 23h30",
          phone: prev?.phone || "+226 70 00 00 00",
          whatsapp: prev?.whatsapp || "22670000000",
          email: prev?.email || "contact@restobf.com",
          plan: "premium",
          template: activeTpl,
        }));
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, tpl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09070b] text-[#f4c15d]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#f4c15d] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#fff3d3]">
            Chargement du restaurant...
          </span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09070b] text-white text-center px-4">
        <div>
          <h1 className="text-3xl font-black text-[#f4c15d] mb-2">Restaurant non disponible</h1>
          <p className="text-white/60">
            Le restaurant <code className="text-[#f4c15d]">{slug}</code> n'est pas accessible
            actuellement.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#f4c15d] to-[#e4b25f] text-[#0a0a0f] font-black shadow-lg"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div
        onClick={(e) => {
          const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
          if (!anchor) return;
          const href = anchor.getAttribute("href");
          if (!href || anchor.target === "_blank") return;
          let url: URL;
          try {
            url = new URL(href, window.location.origin);
          } catch {
            return;
          }
          if (url.pathname === window.location.pathname && url.searchParams.has("view")) {
            e.preventDefault();
            const newView = url.searchParams.get("view") ?? undefined;
            navigate({
              to: ".",
              from: Route.fullPath,
              search: (prev) => ({ ...prev, view: newView }),
              replace: false,
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        {renderTemplate(restaurant.template, { restaurant, menu, reviews, gallery, view })}
        <OrderCartFab restaurant={restaurant} menu={menu} tableNumber={table ?? null} />
      </div>
    </CartProvider>
  );
}
