import React, { useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  QrCode,
  MessageSquare,
  Utensils,
  Smartphone,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Users,
  Wifi,
  Sparkles,
  Zap,
  Globe,
  Bell,
  Sliders,
  DollarSign,
  Printer,
  Calendar,
} from "lucide-react";

export const featuresList = [
  {
    icon: QrCode,
    title: "Menu Digital QR Code",
    desc: "Vos clients scannent et voient votre menu instantanément en HD sans télécharger d'application.",
    badge: "Essentiel",
    color: "#d4a853",
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
  const [isPaused, setIsPaused] = useState(false);

  // Repeat items for seamless 360 continuous infinite scrolling marquee loop
  const marqueeItems = [...featuresList, ...featuresList, ...featuresList];

  return (
    <div className="relative w-full py-10 overflow-hidden">
      {/* Glow Auroras background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-64 bg-[#d4a853]/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Fade Gradients on edges for smooth blend */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />

      {/* ROW 1: Auto-scrolling LEFT */}
      <div
        className="flex gap-4 sm:gap-6 w-max cursor-grab active:cursor-grabbing py-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          animate={{ x: isPaused ? undefined : ["0%", "-33.33%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
          className="flex gap-4 sm:gap-6"
        >
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`row1-${idx}`}
                className="w-[280px] sm:w-[340px] p-6 rounded-2xl border border-border/80 bg-[#111118]/90 backdrop-blur-xl hover:border-[#d4a853]/60 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(212,168,83,0.25)] hover:-translate-y-1 group relative overflow-hidden"
              >
                {/* Glowing subtle hover accent */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1a1a24] border border-border text-foreground/80 uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-[#f0d48a] transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* ROW 2: Auto-scrolling RIGHT (Reverse direction) */}
      <div
        className="flex gap-4 sm:gap-6 w-max cursor-grab active:cursor-grabbing py-3 mt-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          animate={{ x: isPaused ? undefined : ["-33.33%", "0%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          className="flex gap-4 sm:gap-6"
        >
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`row2-${idx}`}
                className="w-[280px] sm:w-[340px] p-6 rounded-2xl border border-border/80 bg-[#111118]/90 backdrop-blur-xl hover:border-[#d4a853]/60 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(212,168,83,0.25)] hover:-translate-y-1 group relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1a1a24] border border-border text-foreground/80 uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-[#f0d48a] transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
