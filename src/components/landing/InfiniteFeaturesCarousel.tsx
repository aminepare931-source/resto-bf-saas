import { useIsMobile } from "@/hooks/use-mobile";
import {
  QrCode,
  MessageSquare,
  Utensils,
  Smartphone,
  PieChart,
  ShieldCheck,
  Printer,
  Bell,
} from "lucide-react";

export const featuresList = [
  {
    icon: QrCode,
    title: "Menu Digital QR Code",
    desc: "Vos clients scannent et voient votre menu instantanément en HD sans télécharger d'application.",
    badge: "Essentiel",
    color: "#c85a32",
  },
  {
    icon: MessageSquare,
    title: "Commandes WhatsApp Directes",
    desc: "Chaque commande arrive formatée directement sur le téléphone du serveur ou du maquis.",
    badge: "Favori BF",
    color: "#25D366",
  },
  {
    icon: Utensils,
    title: "Gestion des Tables & Salles",
    desc: "Suivez l'occupation de vos tables, maquis VIP et terrasses en temps réel.",
    badge: "Organisation",
    color: "#f59e0b",
  },
  {
    icon: Smartphone,
    title: "Paiement Orange Money & Moov",
    desc: "Intégration fluide des solutions Mobile Money locales très populaires au Burkina.",
    badge: "Finances Local",
    color: "#ff6600",
  },
  {
    icon: PieChart,
    title: "Statistiques & Recettes du Jour",
    desc: "Visualisez votre chiffre d'affaires, vos plats les plus vendus et vos marges en 1 coup d'œil.",
    badge: "Analytics",
    color: "#38bdf8",
  },
  {
    icon: ShieldCheck,
    title: "Espace Staff & Cuisine Sécurisé",
    desc: "Accès par code PIN 4 chiffres pour vos serveurs et cuisiniers sans mélange des droits.",
    badge: "Sécurité",
    color: "#10b981",
  },
  {
    icon: Printer,
    title: "Impression Tickets Cuisine",
    desc: "Envoyez automatiquement les commandes à la cuisine sur imprimante thermique Bluetooth/Wifi.",
    badge: "Matériel",
    color: "#a855f7",
  },
  {
    icon: Bell,
    title: "Notifications Sonores en Direct",
    desc: "Bip sonore puissant à chaque nouvelle commande pour ne jamais rater un client.",
    badge: "Direct",
    color: "#ef4444",
  },
];

export function InfiniteFeaturesCarousel() {
  const isMobile = useIsMobile();
  const cardClass = isMobile
    ? "w-[280px] sm:w-[340px] p-6 rounded-2xl border border-border bg-card shadow-card transition-colors duration-300 relative overflow-hidden"
    : "w-[280px] sm:w-[340px] p-6 rounded-2xl border border-border bg-card shadow-card hover:border-terracotta/40 transition-[border-color,box-shadow,transform] duration-300 hover:shadow-elevated hover:-translate-y-1 group relative overflow-hidden";

  // Répété 3× pour une boucle continue parfaitement raccordée (translation de -33.33%)
  const marqueeItems = [...featuresList, ...featuresList, ...featuresList];

  return (
    <div className="relative w-full py-10 overflow-hidden">
      {/* Glow Aurora background — pré-fondu, sans filter blur */}
      {!isMobile && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-64 pointer-events-none rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(200,90,50,0.10) 0%, rgba(200,90,50,0.04) 50%, transparent 75%)",
          }}
        />
      )}

      {/* Fade Gradients on edges for smooth blend */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-muted via-muted/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-muted via-muted/80 to-transparent z-20 pointer-events-none" />

      {/* ROW 1 : défilement gauche (CSS keyframes → thread compositeur) */}
      <div className="marquee-row flex w-max py-3">
        <div
          className="marquee-track marquee-left flex gap-4 sm:gap-6"
          style={{ animationDuration: isMobile ? "55s" : "35s" }}
        >
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`row1-${idx}`} className={cardClass}>
                {/* Halo discret par carte — dégradé pré-fondu */}
                {!isMobile && (
                  <div
                    className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)`,
                    }}
                  />
                )}

                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center border border-black/5 shadow-inner group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-muted border border-border text-muted-foreground uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-terracotta-deep transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 2 : défilement droite (inverse) */}
      <div className="marquee-row flex w-max py-3 mt-2">
        <div
          className="marquee-track marquee-right flex gap-4 sm:gap-6"
          style={{ animationDuration: isMobile ? "60s" : "40s" }}
        >
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`row2-${idx}`} className={cardClass}>
                {!isMobile && (
                  <div
                    className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)`,
                    }}
                  />
                )}

                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center border border-black/5 shadow-inner group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-muted border border-border text-muted-foreground uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-terracotta-deep transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
