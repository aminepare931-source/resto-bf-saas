import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/qr-code")({
  component: QrCodePage,
});

function QrCodePage() {
  const { restaurant: r, loading } = useMyRestaurant();
  const [size, setSize] = useState(512);
  const [color, setColor] = useState("#0a0a0f");
  const [bg, setBg] = useState("#ffffff");
  const [margin, setMargin] = useState(2);
  const [pngUrl, setPngUrl] = useState<string>("");
  const [svgString, setSvgString] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const targetUrl =
    r?.slug && typeof window !== "undefined"
      ? `${window.location.origin}/r/${r.slug}`
      : "";

  useEffect(() => {
    if (!targetUrl) return;
    const opts = {
      errorCorrectionLevel: "H" as const,
      margin,
      width: size,
      color: { dark: color, light: bg },
    };
    QRCode.toDataURL(targetUrl, opts).then(setPngUrl);
    QRCode.toString(targetUrl, { ...opts, type: "svg" }).then(setSvgString);
    if (canvasRef.current) QRCode.toCanvas(canvasRef.current, targetUrl, opts);
  }, [targetUrl, size, color, bg, margin]);

  const download = (href: string, ext: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = `qr-${r?.slug ?? "restaurant"}.${ext}`;
    a.click();
  };

  if (loading) return <p className="text-muted-foreground">Chargement...</p>;
  if (!r?.slug)
    return (
      <div className="max-w-xl p-6 rounded-2xl border border-amber-400/30 bg-amber-400/5">
        <strong className="text-amber-300">Choisissez un template d'abord</strong>
        <p className="text-sm text-muted-foreground mt-2">
          Votre site doit être en ligne pour générer un QR Code.
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">QR Code</p>
        <h1 className="text-3xl font-black">QR Code professionnel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          À imprimer sur vos cartes de table, vitrines, flyers. Pointe directement vers votre site.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="p-8 rounded-3xl border border-white/8 bg-dark-card flex flex-col items-center justify-center">
          <div
            className="p-6 rounded-2xl shadow-2xl"
            style={{ background: bg }}
          >
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
          </div>
          <p className="mt-6 text-xs text-muted-foreground font-mono break-all text-center">
            {targetUrl}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => pngUrl && download(pngUrl, "png")}
              className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm"
            >
              ⬇ Télécharger PNG
            </button>
            <button
              onClick={() => {
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                download(URL.createObjectURL(blob), "svg");
              }}
              className="px-5 py-2.5 rounded-xl border border-gold/40 text-gold font-bold text-sm hover:bg-gold/10"
            >
              ⬇ Télécharger SVG
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(targetUrl);
                toast.success("Lien copié");
              }}
              className="px-5 py-2.5 rounded-xl border border-white/10 font-semibold text-sm"
            >
              📋 Copier le lien
            </button>
            <button
              onClick={() => printCard(targetUrl, r.name, pngUrl)}
              className="px-5 py-2.5 rounded-xl border border-white/10 font-semibold text-sm"
            >
              🖨️ Imprimer carte de table
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <SettingCard label="Taille">
            <input
              type="range"
              min={256}
              max={1024}
              step={64}
              value={size}
              onChange={(e) => setSize(+e.target.value)}
              className="w-full accent-gold"
            />
            <p className="text-xs text-muted-foreground mt-1">{size}×{size} px</p>
          </SettingCard>

          <SettingCard label="Marge">
            <input
              type="range"
              min={0}
              max={8}
              value={margin}
              onChange={(e) => setMargin(+e.target.value)}
              className="w-full accent-gold"
            />
            <p className="text-xs text-muted-foreground mt-1">{margin} blocs</p>
          </SettingCard>

          <SettingCard label="Couleur du QR">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
            />
          </SettingCard>

          <SettingCard label="Fond">
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
            />
          </SettingCard>

          <div className="p-4 rounded-2xl border border-gold/20 bg-gold/5">
            <p className="text-xs uppercase tracking-widest text-gold font-bold mb-1">
              💡 Conseil
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pour l'impression, choisissez 1024×1024 et téléchargez en SVG pour
              une qualité parfaite à toutes les tailles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-white/8 bg-dark-card">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function printCard(url: string, name: string, png: string) {
  const w = window.open("", "_blank", "width=600,height=800");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>QR ${name}</title>
    <style>
      body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:40px;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
      .card{text-align:center;padding:40px;border:2px dashed #c9a14a;border-radius:24px;max-width:480px}
      h1{font-size:28px;margin:0 0 8px;color:#1a1a1a}
      p{color:#666;margin:0 0 24px;font-size:14px;letter-spacing:.15em;text-transform:uppercase}
      img{width:340px;height:340px}
      small{display:block;margin-top:20px;color:#999;font-size:11px;word-break:break-all}
    </style></head>
    <body><div class="card">
      <h1>${name}</h1>
      <p>Scannez pour voir notre menu</p>
      <img src="${png}" alt="QR Code"/>
      <small>${url}</small>
    </div>
    <script>setTimeout(()=>{window.print();window.close()},300)</script>
    </body></html>`);
  w.document.close();
}