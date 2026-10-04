import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";
import { signedUrl } from "@/lib/storage";

type Props = {
  path: string | null | undefined;
  alt: string;
  className?: string;
};

export function StorageImage({ path, alt, className }: Props) {
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
      <div className={`${className ?? ""} flex items-center justify-center bg-surface-warm`}>
        <Utensils className="h-8 w-8 text-muted-foreground/60" />
      </div>
    );
  }
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
