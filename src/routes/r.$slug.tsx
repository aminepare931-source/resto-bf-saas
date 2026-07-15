import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { renderTemplate } from "@/components/public/templates";
import type { PublicRestaurant, PublicMenuItem, PublicReview, PublicGalleryImage } from "@/components/public/shared";
import { OrderCartFab } from "@/components/public/OrderCart";

export const Route = createFileRoute("/r/$slug")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    table: typeof s.table === "string" ? s.table.slice(0, 10) : undefined,
    view: typeof s.view === "string" ? s.view.slice(0, 20) : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Resto BF` },
      { name: "description", content: "Découvrez ce restaurant : menu, photos, avis et contact." },
    ],
  }),
  component: PublicRestaurantPage,
});

function PublicRestaurantPage() {
  const { slug } = Route.useParams();
  const { table, view } = Route.useSearch();
  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [menu, setMenu] = useState<PublicMenuItem[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [gallery, setGallery] = useState<PublicGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: rRaw } = await supabase
        .from("public_restaurants" as never)
        .select("id, name, city, cuisine, description, address, hours, phone, whatsapp, logo_url, template, subscription_status")
        .eq("slug", slug)
        .maybeSingle();

      const r = rRaw as null | {
        id: string; name: string; city: string; cuisine: string | null;
        description: string | null; address: string | null; hours: string | null;
        phone: string; whatsapp: string | null; logo_url: string | null;
        template: string | null;
        subscription_status: string | null;
      };
      if (!r) {
        setMissing(true);
        setLoading(false);
        return;
      }

      // Vérifier si l'abonnement est expiré
      if (r.subscription_status === "expired") {
        setMissing(true);
        setLoading(false);
        return;
      }

      // The public view omits owner email/plan; fill with safe defaults for the renderer.
      setRestaurant({ ...r, email: "", plan: "standard" });

      const [m, rev, g] = await Promise.all([
        supabase.from("menu_items").select("id, category, name, description, price, image_url, available").eq("restaurant_id", r.id).eq("available", true).order("category").order("position"),
        supabase.from("reviews").select("id, author_name, rating, comment, created_at").eq("restaurant_id", r.id).eq("approved", true).order("created_at", { ascending: false }).limit(12),
        supabase.from("gallery_images").select("id, image_url, caption").eq("restaurant_id", r.id).order("position"),
      ]);
      setMenu((m.data ?? []) as PublicMenuItem[]);
      setReviews((rev.data ?? []) as PublicReview[]);
      setGallery((g.data ?? []) as PublicGalleryImage[]);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white/60">
        Chargement...
      </div>
    );
  }

  if (missing || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white text-center px-4">
        <div>
          <h1 className="text-3xl font-black text-gradient-gold mb-2">Restaurant introuvable</h1>
          <p className="text-white/60">Le lien <code className="text-gold">/r/{slug}</code> ne correspond à aucun restaurant.</p>
          <a href="/" className="mt-6 inline-block px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold">Retour à Resto BF</a>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderTemplate(restaurant.template, { restaurant, menu, reviews, gallery, view })}
      <OrderCartFab restaurant={restaurant} menu={menu} tableNumber={table ?? null} />
    </>
  );
}
