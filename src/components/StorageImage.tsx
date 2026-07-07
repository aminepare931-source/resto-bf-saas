import { useEffect, useState } from "react";
import { signedUrl } from "@/lib/storage";

type Props = {
  path: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
};

export function StorageImage({ path, alt, className, fallback }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    if (!path || path.trim() === "") {
      setUrl(null);
      return;
    }
    signedUrl(path).then((u) => {
      if (!cancel) setUrl(u);
    });
    return () => {
      cancel = true;
    };
  }, [path]);

  if (!url) {
    return (
      <div className={`${className ?? ""} flex items-center justify-center bg-white/[0.04] text-3xl`}>
        {fallback ?? "🍽️"}
      </div>
    );
  }
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
