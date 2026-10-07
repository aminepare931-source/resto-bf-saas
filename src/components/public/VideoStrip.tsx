import { StorageVideo } from "@/components/StorageVideo";
import type { PublicGalleryImage } from "./shared";

/** Section vidéos affichée sous les templates qui ne gèrent pas les vidéos eux-mêmes. */
export function VideoStrip({ videos }: { videos: PublicGalleryImage[] }) {
  if (!videos.length) return null;
  return (
    <section className="px-4 py-10 bg-black/90 text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-black mb-5">Nos vidéos</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {videos.map((v) => (
            <StorageVideo key={v.id} path={v.image_url} className="w-full aspect-video rounded-xl bg-black" />
          ))}
        </div>
      </div>
    </section>
  );
}
