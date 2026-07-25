import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Interactive3DButton } from "./Interactive3DButton";
import {
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Palette,
  CheckCircle2,
  QrCode,
  ArrowRight,
} from "lucide-react";

export const templatesData = [
  {
    id: "TplNuit",
    name: "Night Club & Maquis Lounge",
    emoji: "🌙",
    tagline: "Ambiance nocturne ultra-chic & néons dorés",
    colorGradient: "from-purple-950/90 via-slate-900 to-amber-950/60",
    borderColor: "#d4a853",
    accentColor: "#d4a853",
    bgDesc:
      "Thème sombre somptueux avec néons dorés et contrastes profonds. Idéal pour bars VIP, lounges et maquis branchés.",
    features: [
      "Carte des cocktails & boissons VIP",
      "Photos HD avec halo néon",
      "Commandes à table instantanées",
    ],
    badge: "Sensation Nuit",
  },
  {
    id: "TplSoleil",
    name: "Restaurant Soleil & Terrasse",
    emoji: "☀️",
    tagline: "Style lumineux, solaire et chaleureux",
    colorGradient: "from-amber-900/90 via-orange-950 to-yellow-950/60",
    borderColor: "#f59e0b",
    accentColor: "#f59e0b",
    bgDesc:
      "Inspiré par les couleurs solaires d'Afrique de l'Ouest. Parfait pour les restaurants familiaux, buffets et terrasses.",
    features: [
      "Bannières solaires animées",
      "Plats du jour & grillades en vedette",
      "Boutons tactiles WhatsApp",
    ],
    badge: "Bestseller",
  },
  {
    id: "TplSavane",
    name: "Savane & Authenticité",
    emoji: "🌾",
    tagline: "Inspiration terre, tradition & saveurs locales",
    colorGradient: "from-emerald-950/90 via-amber-950 to-stone-900/80",
    borderColor: "#10b981",
    accentColor: "#10b981",
    bgDesc:
      "Reflète le paysage burkinabè et la richesse du terroir local. Apprécié des maquis traditionnels et spécialistes du poulet bicyclette.",
    features: [
      "Motifs culturels élégants",
      "Avis clients mis en valeur",
      "Tri par spécialités régionales",
    ],
    badge: "Authentique",
  },
  {
    id: "TplMarché",
    name: "Fast-Food & Marché Gourmand",
    emoji: "🏪",
    tagline: "Design dynamique & commandes express",
    colorGradient: "from-red-950/90 via-orange-950 to-yellow-950/70",
    borderColor: "#ef4444",
    accentColor: "#ef4444",
    bgDesc:
      "Conçu pour la vitesse : fast-foods, shawarma, poulet braisé express et livraisons à domicile.",
    features: [
      "Boutons de commande 1-clic",
      "Promotions & menus combos",
      "Optimisé pour téléphones",
    ],
    badge: "Ultra Rapide",
  },
  {
    id: "TplModerne",
    name: "Minimaliste & Gastronomie",
    emoji: "✨",
    tagline: "Élégance épurée & haute gastronomie",
    colorGradient: "from-zinc-900 via-neutral-900 to-black",
    borderColor: "#38bdf8",
    accentColor: "#38bdf8",
    bgDesc:
      "Pour les grandes tables, traiteurs de prestige et restaurants modernes à Ouagadougou et Bobo-Dioulasso.",
    features: [
      "Mise en page épurée prestige",
      "Réservation de tables VIP",
      "Galerie photo grand format",
    ],
    badge: "Prestige",
  },
];

export function TemplateCarousel3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play infinite rotation loop
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % templatesData.length);
      }, 3500);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + templatesData.length) % templatesData.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % templatesData.length);
  };

  const activeTpl = templatesData[activeIndex];

  return (
    <div
      className="relative w-full max-w-6xl mx-auto py-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4a853] animate-ping" />
          <span className="text-xs font-bold text-[#f0d48a] uppercase tracking-wider">
            Sélecteur 3D Interactif ({activeIndex + 1}/{templatesData.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 rounded-xl bg-[#111118] border border-border text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title={
              isAutoPlaying ? "Mettre en pause le défilement" : "Lancer le défilement automatique"
            }
          >
            {isAutoPlaying ? (
              <Pause className="w-3.5 h-3.5 text-[#d4a853]" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {isAutoPlaying ? "Défilement Auto Active" : "Lecture Auto"}
            </span>
          </button>

          <div className="flex items-center gap-1 bg-[#111118] p-1 rounded-xl border border-border">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-[#1a1a24] text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-[#1a1a24] text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Circular Coverflow Stage */}
      <div className="relative h-[380px] sm:h-[420px] flex items-center justify-center perspective-1200 overflow-hidden px-4">
        {templatesData.map((tpl, index) => {
          // Calculate offset relative to active card
          let offset = index - activeIndex;

          // Wrap-around logic for smooth looping
          if (offset < -2) offset += templatesData.length;
          if (offset > 2) offset -= templatesData.length;

          const isCurrent = offset === 0;
          const absOffset = Math.abs(offset);

          // 3D Matrix Math Transformations
          const rotateY = offset * -25; // 3D rotation angle
          const translateZ = isCurrent ? 120 : -100 * absOffset; // Depth
          const translateX = offset * 240; // Horizontal offset in px
          const scale = isCurrent ? 1.05 : 0.85 - absOffset * 0.1;
          const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.35;
          const zIndex = 30 - absOffset * 10;

          return (
            <motion.div
              key={tpl.id}
              onClick={() => setActiveIndex(index)}
              animate={{
                rotateY: `${rotateY}deg`,
                translateZ: `${translateZ}px`,
                x: `${translateX}px`,
                scale,
                opacity,
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                zIndex,
                transformStyle: "preserve-3d",
              }}
              className={`absolute w-[290px] sm:w-[350px] h-[340px] sm:h-[370px] rounded-2xl border bg-[#111118] overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 ${
                isCurrent
                  ? "border-[#d4a853] ring-2 ring-[#d4a853]/40 shadow-[0_20px_60px_rgba(212,168,83,0.3)]"
                  : "border-border hover:border-[#d4a853]/40"
              }`}
            >
              {/* Card Gradient Header */}
              <div
                className={`h-full p-6 bg-gradient-to-br ${tpl.colorGradient} flex flex-col justify-between relative`}
              >
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#d4a853]" /> {tpl.badge}
                  </span>
                  <span className="text-3xl">{tpl.emoji}</span>
                </div>

                {/* Center Content */}
                <div className="relative z-10 my-auto">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f0d48a] block mb-1">
                    Template {tpl.id}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-2 font-medium line-clamp-2">
                    {tpl.tagline}
                  </p>
                </div>

                {/* Bottom Mock Preview Bar */}
                <div className="relative z-10 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs text-white">
                  <span className="font-bold text-[11px] truncate">Menu QR & WhatsApp</span>
                  <span
                    className="px-2.5 py-1 rounded font-bold text-[10px] shrink-0"
                    style={{ backgroundColor: tpl.accentColor, color: "#0a0a0f" }}
                  >
                    Voir Aperçu
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Dots Indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {templatesData.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => setActiveIndex(idx)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              activeIndex === idx
                ? "w-8 bg-[#d4a853] shadow-[0_0_12px_rgba(212,168,83,0.8)]"
                : "w-2.5 bg-border hover:bg-[#d4a853]/50"
            }`}
          />
        ))}
      </div>

      {/* Active Selected Template Detail Highlight Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTpl.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="mt-8 p-6 sm:p-8 rounded-2xl border border-[#d4a853]/40 bg-[#111118]/95 backdrop-blur-xl shadow-2xl grid md:grid-cols-12 gap-6 items-center"
        >
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeTpl.emoji}</span>
              <h4 className="text-xl font-bold text-foreground">{activeTpl.name}</h4>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {activeTpl.bgDesc}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {activeTpl.features.map((feat) => (
                <span
                  key={feat}
                  className="px-3 py-1 rounded-lg bg-[#1a1a24] border border-border text-xs text-foreground/90 font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {feat}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <Interactive3DButton
              to="/auth/inscription"
              search={{ template: activeTpl.id }}
              variant="primary"
              size="md"
              className="w-full"
            >
              Choisir {activeTpl.id} (30j gratuits)
            </Interactive3DButton>

            <p className="text-[11px] text-center text-muted-foreground">
              Modifiable à tout moment en 1 clic
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
