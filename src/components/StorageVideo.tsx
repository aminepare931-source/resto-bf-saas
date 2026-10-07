import { useEffect, useState } from "react";
import { signedUrl } from "@/lib/storage";

/** Vidéo stockée dans le bucket restaurant-media (URL signée). */
export function StorageVideo({
  path,
  className,
  poster,
}: {
  path: string | null | undefined;
  className?: string;
  poster?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancel = false;
    signedUrl(path).then((u) => !cancel && setUrl(u));
    return () => {
      cancel = true;
    };
  }, [path]);
  if (!url) return <div className={`${className ?? ""} bg-black/20 animate-pulse`} />;
  return (
    <video
      src={url}
      poster={poster}
      className={className}
      controls
      playsInline
      preload="metadata"
    />
  );
}
