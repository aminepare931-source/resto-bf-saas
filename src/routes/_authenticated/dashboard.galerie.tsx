import { usePlanAccess, galleryPhotoLimit, GALLERY_VIDEO_LIMIT } from "@/lib/plans";
import { StorageVideo } from "@/components/StorageVideo";
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

type Img = {
  id: string;
  image_url: string;
  caption: string | null;
  position: number;
  media_type: string;
};

const MAX_VIDEO_MB = 40;

function GalleryPage() {
  const { restaurant } = useMyRestaurant();
  const [images, setImages] = useState<Img[]>([]);
  const [busy, setBusy] = useState(false);

  const { has, hasAny } = usePlanAccess(restaurant?.plan);
  const canPhotos = hasAny(["galerie-photos", "galerie-illimitee"]);
  const canVideos = has("galerie-videos");
  const photoMax = galleryPhotoLimit(has);

  const load = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("gallery_images")
      .select("id, image_url, caption, position, media_type")
      .eq("restaurant_id", restaurant.id)
      .order("position");
    setImages((data ?? []) as Img[]);
  };

  useEffect(() => {
    load();
  }, [restaurant?.id]);

  const photos = images.filter((i) => i.media_type !== "video");
  const videos = images.filter((i) => i.media_type === "video");

  const onUpload = async (files: FileList | null, kind: "image" | "video") => {
    if (!files || !restaurant) return;
    const list = Array.from(files);
    const current = kind === "video" ? videos.length : photos.length;
    const max = kind === "video" ? GALLERY_VIDEO_LIMIT : photoMax;
    if (current + list.length > max) {
      toast.error(
        `Limite atteinte : ${max} ${kind === "video" ? "vidéos" : "photos"} maximum sur votre forfait.`,
      );
      return;
    }
    if (kind === "video" && list.some((f) => f.size > MAX_VIDEO_MB * 1024 * 1024)) {
      toast.error(`Vidéo trop lourde (${MAX_VIDEO_MB} Mo maximum).`);
      return;
    }
    setBusy(true);
    try {
      for (const file of list) {
        const path = await uploadRestaurantFile(restaurant.id, file);
        const { error } = await supabase.from("gallery_images").insert({
          restaurant_id: restaurant.id,
          image_url: path,
          position: images.length,
          media_type: kind,
        });
        if (error) throw error;
      }
      toast.success(kind === "video" ? "Vidéos ajoutées ✓" : "Photos ajoutées ✓");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (img: Img) => {
    if (!confirm("Supprimer ce média ?")) return;
    await deleteRestaurantFile(img.image_url);
    await supabase.from("gallery_images").delete().eq("id", img.id);
    load();
  };

  return (
    <div className="max-w-5xl space-y-10">
      {canPhotos && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-terracotta font-bold mb-2">Galerie</p>
              <h1 className="text-3xl font-black">Photos d'ambiance</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {photos.length} / {Number.isFinite(photoMax) ? photoMax : "∞"} photos
              </p>
            </div>
            <label className="px-5 py-3 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-deep transition-colors cursor-pointer">
              {busy ? "Envoi..." : "+ Ajouter des photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onUpload(e.target.files, "image")}
                disabled={busy}
              />
            </label>
          </div>
          {photos.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
              Aucune photo. Ajoutez vos clichés de salle, terrasse, équipe...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((img) => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square border border-border">
                  <StorageImage path={img.image_url} alt={img.caption ?? "Photo"} className="w-full h-full object-cover" />
                  <button
                    onClick={() => remove(img)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-charcoal/80 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {canVideos && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-black">Vidéos</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {videos.length} / {GALLERY_VIDEO_LIMIT} vidéos · {MAX_VIDEO_MB} Mo max chacune
              </p>
            </div>
            <label className="px-5 py-3 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-deep transition-colors cursor-pointer">
              {busy ? "Envoi..." : "+ Ajouter une vidéo"}
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => onUpload(e.target.files, "video")}
                disabled={busy}
              />
            </label>
          </div>
          {videos.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
              Aucune vidéo. Montrez vos plats, votre cuisine, l'ambiance.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {videos.map((v) => (
                <div key={v.id} className="group relative rounded-xl overflow-hidden border border-border bg-black">
                  <StorageVideo path={v.image_url} className="w-full aspect-video" />
                  <button
                    onClick={() => remove(v)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-charcoal/80 text-white hover:bg-destructive transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
