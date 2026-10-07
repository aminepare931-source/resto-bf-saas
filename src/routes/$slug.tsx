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
import { effectiveTemplateFor, isSiteOffline, usePlanAccess } from "@/lib/plans";
import { VideoStrip } from "@/components/public/VideoStrip";

export const Route = createFileRoute("/$slug")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    table: typeof s.table === "string" ? s.table.slice(0, 10) : undefined,
    view: typeof s.view === "string" ? s.view.slice(0, 20) : undefined,
    tpl: typeof s.tpl === "string" ? s.tpl.slice(0, 30) : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — RestoBF` },
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

  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [menu, setMenu] = useState<PublicMenuItem[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [gallery, setGallery] = useState<PublicGalleryImage[]>([]);
  const [videos, setVideos] = useState<PublicGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  // Site coupé pour le public (abonnement expiré / suspendu / annulé)
  const [offlineStatus, setOfflineStatus] = useState<string | null>(null);
  // Le propriétaire / super admin peut voir son site même coupé
  const [viewerBypass, setViewerBypass] = useState(false);

  const access = usePlanAccess(restaurant?.plan);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setOfflineStatus(null);
      setViewerBypass(false);

      // Mode démo : uniquement pour /demo
      if (slug === "demo") {
        const name = humanizeSlug(slug);
        setRestaurant({
          id: "demo",
          name,
          city: "Ouagadougou",
          cuisine: "Cuisine burkinabè & grillades au feu de bois",
          description: `Bienvenue chez ${name} ! Découvrez notre carte, nos spécialités grillées au feu de bois et notre service traiteur.`,
          address: "Secteur 4, Avenue Kwame N'Krumah, Ouagadougou",
          hours: "Lundi — Dimanche · 11h00 — 23h30",
          phone: "+226 70 00 00 00",
          whatsapp: "22670000000",
          email: "contact@restobf.com",
          logo_url: null,
          plan: "premium",
          template: tpl || "prem-royal",
        });
        setMenu(demoData.menu);
        setReviews(demoData.reviews);
        setGallery(demoData.gallery);
        setLoading(false);
        return;
      }

      const cols =
        "id, name, city, cuisine, description, address, hours, phone, whatsapp, email, plan, logo_url, template, subscription_status, offers_delivery, hero_title, hero_subtitle, about_text, primary_color, font_family, social_links";

      let rRaw: any = null;
      let fromPublicView = true;
      try {
        const res = await supabase
          .from("public_restaurants" as never)
          .select(cols)
          .eq("slug", slug)
          .maybeSingle();
        rRaw = res.data;

        if (!rRaw) {
          // Le propriétaire / super admin lit directement la table (RLS)
          fromPublicView = false;
          const fb = await supabase.from("restaurants").select(cols).eq("slug", slug).maybeSingle();
          rRaw = fb.data;
        }
      } catch (err) {
        console.warn("Supabase query error:", err);
      }

      if (!isMounted) return;

      if (!rRaw) {
        setRestaurant(null);
        setLoading(false);
        return;
      }

      const status: string | null = rRaw.subscription_status ?? null;
      if (isSiteOffline(status)) {
        setOfflineStatus(status);
        // lecture directe de la table = propriétaire ou super admin
        setViewerBypass(!fromPublicView);
        if (fromPublicView) {
          setRestaurant(null);
          setLoading(false);
          return;
        }
      }

      setRestaurant({
        id: rRaw.id,
        name: rRaw.name,
        city: rRaw.city,
        cuisine: rRaw.cuisine ?? null,
        description: rRaw.description ?? null,
        address: rRaw.address ?? null,
        hours: rRaw.hours ?? null,
        phone: rRaw.phone,
        whatsapp: rRaw.whatsapp ?? null,
        email: rRaw.email ?? "",
        logo_url: rRaw.logo_url ?? null,
        offers_delivery: rRaw.offers_delivery ?? false,
        hero_title: rRaw.hero_title ?? null,
        hero_subtitle: rRaw.hero_subtitle ?? null,
        about_text: rRaw.about_text ?? null,
        primary_color: rRaw.primary_color ?? null,
        font_family: rRaw.font_family ?? null,
        social_links: rRaw.social_links ?? null,
        // Le vrai forfait, plus de "premium" forcé
        plan: rRaw.plan ?? "basique",
        // ?tpl= = aperçu explicite ; sinon template de la base, borné au forfait
        template: tpl || rRaw.template || null,
      });

      try {
        const [m, rev, g] = await Promise.all([
          supabase
            .from("menu_items")
            .select("id, category, name, description, price, image_url, available")
            .eq("restaurant_id", rRaw.id)
            .eq("available", true)
            .order("category")
            .order("position"),
          supabase
            .from("reviews")
            .select("id, author_name, rating, comment, created_at, owner_reply")
            .eq("restaurant_id", rRaw.id)
            .eq("approved", true)
            .order("created_at", { ascending: false })
            .limit(12),
          supabase
            .from("gallery_images")
            .select("id, image_url, caption, media_type")
            .eq("restaurant_id", rRaw.id)
            .order("position"),
        ]);
        if (!isMounted) return;
        setMenu((m.data ?? []) as PublicMenuItem[]);
        setReviews((rev.data ?? []) as PublicReview[]);
        const media = (g.data ?? []) as (PublicGalleryImage & { media_type?: string })[];
        setGallery(media.filter((x) => x.media_type !== "video"));
        setVideos(media.filter((x) => x.media_type === "video"));
      } catch (e) {
        console.warn("Details fetch error:", e);
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
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] text-[#c85a32]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c85a32] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#57423b]">
            Chargement du restaurant...
          </span>
        </div>
      </div>
    );
  }

  if (!restaurant && offlineStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] text-[#2b211c] text-center px-4">
        <div className="max-w-md">
          <h1 className="text-3xl font-black text-[#9f3c16] mb-2">
            Site temporairement indisponible
          </h1>
          <p className="text-[#57423b]">
            Ce restaurant n'est pas accessible pour le moment. Merci de revenir plus tard.
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] text-[#2b211c] text-center px-4">
        <div>
          <h1 className="text-3xl font-black text-[#9f3c16] mb-2">Restaurant introuvable</h1>
          <p className="text-[#57423b]">
            Le restaurant <code className="text-[#9f3c16]">{slug}</code> n'existe pas ou n'est pas
            accessible actuellement.
          </p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#c85a32] to-[#9f3c16] text-white font-black shadow-lg"
          >
            Retour à l'accueil
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
        {viewerBypass && offlineStatus && (
          <div className="fixed top-0 inset-x-0 z-[60] bg-red-600 text-white text-center text-xs font-bold py-1.5 px-3">
            Site hors ligne pour le public — abonnement « {offlineStatus} ». Vous seul le voyez.
          </div>
        )}
        {(() => {
          // Chaque case cochée dans le super admin décide de ce que le visiteur voit
          const showReviews = access.has("avis-clients");
          const showPhotos = access.hasAny(["galerie-photos", "galerie-illimitee"]);
          const showVideos = access.has("galerie-videos");
          const showCategories = access.has("categories-plats");
          const gatedMenu = showCategories ? menu : menu.map((m) => ({ ...m, category: "Menu" }));
          const gatedVideos = showVideos ? videos : [];
          const t = tpl ? (restaurant.template ?? "") : effectiveTemplateFor(access.has, restaurant.template);
          const stdHandlesVideos = [
            "soleil",
            "savane",
            "marche",
            "moderne",
            "std-soleil",
            "std-savane",
            "std-marche",
            "std-moderne",
          ].includes(t);
          return (
            <>
              {renderTemplate(t, {
                restaurant: {
                  ...restaurant,
                  template: t,
                  whatsapp: access.has("commande-whatsapp") ? restaurant.whatsapp : null,
                  logo_url: access.has("logo-personnalise") ? restaurant.logo_url : null,
                  primary_color: access.has("personnalisation-couleurs")
                    ? restaurant.primary_color
                    : null,
                  font_family: access.has("personnalisation-police")
                    ? restaurant.font_family
                    : null,
                  hero_title: access.has("contenu-branding") ? restaurant.hero_title : null,
                  hero_subtitle: access.has("contenu-branding") ? restaurant.hero_subtitle : null,
                  about_text: access.has("contenu-branding") ? restaurant.about_text : null,
                  social_links: access.has("reseaux-sociaux") ? restaurant.social_links : null,
                },
                menu: gatedMenu,
                reviews: showReviews ? reviews : [],
                gallery: showPhotos ? gallery : [],
                videos: gatedVideos,
                view,
              })}
              {!stdHandlesVideos && <VideoStrip videos={gatedVideos} />}
            </>
          );
        })()}
        {access.has("panier-commande") && (
          <OrderCartFab restaurant={restaurant} menu={menu} tableNumber={table ?? null} />
        )}
      </div>
    </CartProvider>
  );
}
