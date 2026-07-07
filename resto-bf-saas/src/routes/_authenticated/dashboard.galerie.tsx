import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { uploadRestaurantFile, deleteRestaurantFile } from "@/lib/storage";
import { StorageImage } from "@/components/StorageImage";

export const Route = createFileRoute("/_authenticated/dashboard/galerie")({
  component: GalleryPage,
});

type Img = { id: string; image_url: string; caption: string | null; position: number };

function GalleryPage() {
  const { restaurant } = useMyRestaurant();
  const [images, setImages] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);

  const isPremium = restaurant?.plan === "premium";

  const load = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("gallery_images")
      .select("id, image_url, caption, position")
      .eq("restaurant_id", restaurant.id)
      .order("position");
    setImages((data ?? []) as Img[]);
  };

  useEffect(() => { load(); }, [restaurant?.id]);

  const onUpload = async (files: FileList | null) => {
    if (!files || !restaurant) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const path = await uploadRestaurantFile(restaurant.id, file);
        await supabase.from("gallery_images").insert({
          restaurant_id: restaurant.id,
          image_url: path,
          position: images.length,
        });
      }
      toast.success("Photos ajoutées ✓");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (img: Img) => {
    if (!confirm("Supprimer cette photo ?")) return;
    await deleteRestaurantFile(img.image_url);
    await supabase.from("gallery_images").delete().eq("id", img.id);
    load();
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Galerie</p>
          <h1 className="text-3xl font-black">Photos d'ambiance</h1>
          {!isPremium && (
            <p className="mt-2 text-sm text-amber-400">
              La galerie est une fonctionnalité Premium. Vous pouvez ajouter quelques photos, elles apparaîtront si vous passez en Premium.
            </p>
          )}
        </div>
        <label className="px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold transition-shadow cursor-pointer">
          {busy ? "Envoi..." : "+ Ajouter des photos"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} disabled={busy} />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-white/10 text-center text-muted-foreground">
          Aucune photo. Ajoutez vos clichés de salle, terrasse, équipe...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square border border-white/10">
              <StorageImage path={img.image_url} alt={img.caption ?? "Photo"} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(img)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
