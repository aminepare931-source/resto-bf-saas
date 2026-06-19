import { supabase } from "@/integrations/supabase/client";

const BUCKET = "restaurant-media";

const cache = new Map<string, { url: string; expires: number }>();

export async function signedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const now = Date.now();
  const cached = cache.get(path);
  if (cached && cached.expires > now) return cached.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error || !data) return null;
  cache.set(path, { url: data.signedUrl, expires: now + 55 * 60 * 1000 });
  return data.signedUrl;
}

export async function uploadRestaurantFile(restaurantId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${restaurantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteRestaurantFile(path: string) {
  if (!path || path.startsWith("http")) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export { BUCKET as RESTAURANT_BUCKET };
