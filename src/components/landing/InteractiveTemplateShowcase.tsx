import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Motion3DTiltCard } from "./Motion3DTiltCard";
import { Interactive3DButton } from "./Interactive3DButton";
import { Sparkles, Eye, Check, Palette } from "lucide-react";
import { Link } from "@tanstack/react-router";

const templatesData = [
  {
    id: "TplNuit",
    name: "Night Club & Maquis Lounge",
    emoji: "🌙",
    tagline: "Ambiance nocturne ultra-chic",
    colorGradient: "from-purple-900/80 via-slate-900 to-amber-900/40",
    accentColor: "#d4a853",
    bgDesc:
      "Thème sombre avec néons dorés et contrastes profonds pour bars, maquis VIP et lounges.",
    features: [
      "Carte des cocktails & boissons VIP",
      "Photos haute résolution avec halo",
      "Ambiance somptueuse",
    ],
    slug: "demo-nuit",
  },
  {
    id: "TplSoleil",
    name: "Restaurant Soleil & Terrasse",
    emoji: "☀️",
    tagline: "Style lumineux et chaleureux",
    colorGradient: "from-amber-600/80 via-orange-900/60 to-yellow-900/40",
    accentColor: "#f59e0b",
    bgDesc:
      "Couleurs solaires d'Afrique de l'Ouest, parfait pour restaurants familiaux et buffets.",
    features: [
      "Bannières solaires dynamiques",
      "Grillades & plats du jour en vedette",
      "Boutons dorés tactiles",
    ],
    slug: "demo-soleil",
  },
  {
    id: "TplSavane",
    name: "Savane & Authenticité",
    emoji: "🌾",
    tagline: "Inspiration terre & tradition",
    colorGradient: "from-emerald-950/80 via-amber-950 to-stone-900",
    accentColor: "#10b981",
    bgDesc: "Inspiré par le paysage burkinabè et la cuisine authentique du terroir.",
    features: [
      "Motifs traditionnels stylisés",
      "Avis clients mis en avant",
      "Menu par spécialités régionales",
    ],
    slug: "demo-savane",
  },
  {
    id: "TplMarché",
    name: "Fast-Food & Marché Gourmand",
    emoji: "🏪",
    tagline: "Design vivace et vendeurs rapides",
    colorGradient: "from-red-950/80 via-orange-950 to-yellow-950",
    accentColor: "#ef4444",
    bgDesc:
      "Super adapté pour fast-foods, grillades rapides, shawarma, sandwicheries et livraisons express.",
    features: [
      "Commandes en 1-clic rapides",
      "Promotions & menus combos",
      "Incitations WhatsApp immédiates",
    ],
    slug: "demo-marche",
  },
  {
    id: "TplModerne",
    name: "Minimaliste & Haute Gastronomie",
    emoji: "✨",
    tagline: "Élégance épurée et contemporaine",
    colorGradient: "from-zinc-900 via-neutral-900 to-black",
    accentColor: "#38bdf8",
    bgDesc:
      "Pour traiteurs de prestige, tables gastronomiques et restaurants modernes à Ouagadougou.",
    features: [
      "Mise en page épurée studio",
      "Réservation de tables VIP",
      "Galerie photo grand format",
    ],
    slug: "demo-moderne",
  },
];

export function InteractiveTemplateShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState(templatesData[0]);

  return (
    <div className="space-y-8">
      {/* Selector Pills with 3D animation */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {templatesData.map((tpl) => {
          const isSelected = selectedTemplate.id === tpl.id;
          return (
            <motion.button
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#d4a853] text-[#0a0a0f] shadow-[0_0_20px_rgba(212,168,83,0.5)] font-bold"
                  : "bg-[#111118] text-muted-foreground hover:text-foreground border border-border hover:border-[#d4a853]/40"
              }`}
            >
              <span>{tpl.emoji}</span>
              <span>{tpl.name.split("&")[0]}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Featured Selected Template Card with 3D Depth */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTemplate.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto rounded-2xl border border-[#d4a853]/40 bg-[#111118] overflow-hidden shadow-2xl grid md:grid-cols-12 gap-0"
        >
          {/* Visual Preview Side */}
          <div
            className={`md:col-span-7 p-6 sm:p-8 bg-gradient-to-br ${selectedTemplate.colorGradient} relative flex flex-col justify-between overflow-hidden min-h-[300px]`}
          >
            {/* Background Grid Pattern Overlay */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#d4a853]" /> Template {selectedTemplate.id}
              </span>
              <span className="text-3xl animate-bounce">{selectedTemplate.emoji}</span>
            </div>

            <div className="relative z-10 my-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                {selectedTemplate.name}
              </h3>
              <p className="text-sm text-white/80 mt-2 font-medium leading-relaxed">
                {selectedTemplate.bgDesc}
              </p>
            </div>

            {/* Mock Header Menu Bar inside preview */}
            <div className="relative z-10 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs text-white">
              <span className="font-bold tracking-wide">Mon Restaurant</span>
              <span className="px-2.5 py-1 rounded bg-[#d4a853] text-[#0a0a0f] font-bold text-[10px]">
                Commander WhatsApp
              </span>
            </div>
          </div>

          {/* Details & Features Side */}
          <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#111118] space-y-6">
            <div>
              <div className="text-xs font-bold text-[#f0d48a] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Points Forts Du Template
              </div>
              <h4 className="text-lg font-bold text-foreground mb-4">{selectedTemplate.tagline}</h4>

              <ul className="space-y-3">
                {selectedTemplate.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <span className="w-4 h-4 rounded-full bg-[#d4a853]/20 text-[#f0d48a] flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      ✓
                    </span>
                    <span className="text-foreground/90 font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
              <Interactive3DButton
                to="/auth/inscription"
                search={{ template: selectedTemplate.id }}
                variant="primary"
                size="md"
                className="w-full"
              >
                Choisir ce template gratuitement
              </Interactive3DButton>

              <p className="text-[11px] text-center text-muted-foreground">
                Changement de template possible à tout moment en 1 clic
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Grid of all 5 templates as 3D Tilt Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-4">
        {templatesData.map((t, idx) => (
          <Motion3DTiltCard key={t.id} delay={idx * 0.1} maxRotate={8}>
            <div
              onClick={() => setSelectedTemplate(t)}
              className="p-4 flex flex-col justify-between h-full cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div>
                <div className="text-2xl mb-2">{t.emoji}</div>
                <h4 className="text-xs font-bold text-foreground leading-tight">{t.id}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{t.tagline}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                <span className="text-[#f0d48a] font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Aperçu
                </span>
                {selectedTemplate.id === t.id && (
                  <span className="w-2 h-2 rounded-full bg-[#d4a853] animate-ping" />
                )}
              </div>
            </div>
          </Motion3DTiltCard>
        ))}
      </div>
    </div>
  );
}
