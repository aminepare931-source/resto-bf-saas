import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Utensils,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  Bell,
  ChefHat,
  MessageSquare,
  Zap,
} from "lucide-react";

export function InteractiveDashboard3D() {
  const [activeTab, setActiveTab] = useState<"overview" | "kitchen" | "menu" | "stats">("overview");
  const [orders, setOrders] = useState([
    {
      id: "CMD-104",
      plat: "Poulet braisé royal + Frites",
      client: "Moussa T.",
      total: "5 500 FCFA",
      time: "À l'instant",
      status: "Nouveau",
      type: "WhatsApp",
    },
    {
      id: "CMD-103",
      plat: "Poisson grillé Capitaine",
      client: "Awa D.",
      total: "7 000 FCFA",
      time: "il y a 4 min",
      status: "En cuisine",
      type: "Sur table",
    },
    {
      id: "CMD-102",
      plat: "Riz gras & Brochettes bœuf",
      client: "Kouka R.",
      total: "3 500 FCFA",
      time: "il y a 12 min",
      status: "Prêt",
      type: "WhatsApp",
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleSimulateOrder = () => {
    const newCmd = {
      id: `CMD-${105 + orders.length}`,
      plat: "Alloco spécial & Poulet Yassa",
      client: "Client En Ligne",
      total: "4 500 FCFA",
      time: "À l'instant",
      status: "Nouveau",
      type: "WhatsApp",
    };

    setOrders((prev) => [newCmd, ...prev.slice(0, 2)]);
    setNotification("🔔 Nouvelle commande reçue par WhatsApp ! (4 500 FCFA)");

    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto lg:mx-0 perspective-1000">
      {/* 3D Gold Glow Aura Background */}
      <motion.div
        className="absolute -inset-10 -z-10 rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,83,0.45) 0%, rgba(212,168,83,0.15) 50%, transparent 75%)",
          filter: "blur(32px)",
        }}
      />

      {/* Floating 3D Badge 1 - Top Right */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{
          y: [-6, 6, -6],
          rotate: [-1, 2, -1],
          opacity: 1,
        }}
        transition={{
          y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 5.5, ease: "easeInOut" },
          opacity: { duration: 0.8 },
        }}
        className="absolute -top-6 -right-4 sm:-right-8 z-30 px-3.5 py-2 rounded-xl bg-[#1a1a24]/95 border border-[#d4a853]/50 text-foreground shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold"
      >
        <div className="w-7 h-7 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-[#f0d48a]">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Commande Directe
          </div>
          <div className="text-xs text-[#f0d48a] font-bold">+12 500 FCFA WhatsApp</div>
        </div>
      </motion.div>

      {/* Floating 3D Badge 2 - Bottom Left */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: [6, -6, 6],
          rotate: [1, -2, 1],
          opacity: 1,
        }}
        transition={{
          y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 },
          rotate: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 },
          opacity: { duration: 0.8 },
        }}
        className="absolute -bottom-6 -left-4 sm:-left-8 z-30 px-3.5 py-2 rounded-xl bg-[#1a1a24]/95 border border-emerald-500/40 text-foreground shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <ChefHat className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Écran Cuisine
          </div>
          <div className="text-xs text-emerald-400 font-bold">Prêt en 8 minutes ⚡</div>
        </div>
      </motion.div>

      {/* Live Toast Alert Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            className="absolute top-2 left-4 right-4 z-40 p-2.5 rounded-lg bg-[#d4a853] text-[#0a0a0f] text-xs font-bold shadow-2xl flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-current animate-bounce" />
              {notification}
            </span>
            <span
              className="text-[10px] underline cursor-pointer"
              onClick={() => setNotification(null)}
            >
              OK
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3D Card Shell */}
      <motion.div
        whileHover={{ rotateY: -3, rotateX: 3, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative rounded-2xl border border-[#d4a853]/30 bg-[#111118]/95 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#1a1a24]/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-foreground">Resto BF Dashboard</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0a0a0f] px-2.5 py-1 rounded-lg border border-border">
            <Sparkles className="w-3 h-3 text-[#d4a853]" />
            <span className="text-[11px] font-medium text-[#f0d48a]">Maquis Le Karité</span>
          </div>
        </div>

        {/* Navigation Tabs inside Mockup */}
        <div className="flex border-b border-border bg-[#0a0a0f]/80 text-xs overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Aperçu Direct", icon: ShoppingBag },
            { id: "kitchen", label: "Cuisine (3)", icon: ChefHat },
            { id: "menu", label: "Menu Digital", icon: Utensils },
            { id: "stats", label: "Statistiques", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[100px] py-2.5 px-3 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all relative ${
                  isActive
                    ? "text-[#f0d48a] font-semibold bg-[#111118]"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeDashTab"
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-[#d4a853]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4 min-h-[260px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Stats Summary row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#1a1a24] border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Ventes Jour</div>
                    <div className="text-sm font-bold text-[#f0d48a]">68 500 FCFA</div>
                    <div className="text-[10px] text-emerald-400 font-medium">+24% vs hier</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a24] border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Commandes</div>
                    <div className="text-sm font-bold text-foreground">18 aujourd'hui</div>
                    <div className="text-[10px] text-emerald-400 font-medium">94% WhatsApp</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#1a1a24] border border-border/60">
                    <div className="text-[10px] text-muted-foreground">Tables QR</div>
                    <div className="text-sm font-bold text-foreground">6 active(s)</div>
                    <div className="text-[10px] font-medium text-amber-400">Salle pleine</div>
                  </div>
                </div>

                {/* Live Feed Orders */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Flux des commandes WhatsApp & Salle
                    </span>
                    <button
                      onClick={handleSimulateOrder}
                      className="text-[10px] font-bold text-[#d4a853] hover:underline flex items-center gap-1 cursor-pointer bg-[#d4a853]/10 px-2 py-0.5 rounded border border-[#d4a853]/30"
                    >
                      <Zap className="w-3 h-3" /> Simuler 1 commande
                    </button>
                  </div>

                  {orders.map((cmd) => (
                    <motion.div
                      key={cmd.id}
                      layout
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-2.5 rounded-xl bg-[#1a1a24]/80 border border-border flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground truncate">
                          <span>{cmd.plat}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>{cmd.client}</span>
                          <span>•</span>
                          <span className="text-[#f0d48a] font-medium">{cmd.total}</span>
                          <span>•</span>
                          <span>{cmd.time}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${
                          cmd.status === "Nouveau"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                            : cmd.status === "En cuisine"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {cmd.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "kitchen" && (
              <motion.div
                key="kitchen"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="p-3 rounded-xl bg-[#1a1a24] border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#f0d48a] flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4" /> Écran Cuisinier (Temps réel)
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      3 Bons en attente
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Les cuisiniers reçoivent directement la commande sur tablette ou téléphone.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="text-xs font-bold text-amber-300">
                      Table 4 — Poulet Braisé x2
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Cuisson : Bien cuit, Piment à part
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Reçu il y a 3 min
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="text-xs font-bold text-blue-300">
                      WhatsApp — Capitaine Grillé
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Accompagnement : Attiéké & Frites
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-blue-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Reçu il y a 8 min
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="p-3 rounded-xl bg-[#1a1a24] border border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-foreground">Menu QR Code Dynamique</div>
                    <div className="text-[10px] text-muted-foreground">
                      Mise à jour instantanée des prix et plats
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-[#f0d48a]">
                    <QrCode className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { name: "Poulet Yassa Fait Maison", price: "4 000 FCFA", cat: "Plats Chauds" },
                    { name: "Brochettes de Bœuf Grillées", price: "2 500 FCFA", cat: "Grillades" },
                    { name: "Jus de Bissap Glacé 50cl", price: "1 000 FCFA", cat: "Boissons" },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="p-2 rounded-lg bg-[#1a1a24]/60 border border-border/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-foreground block">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.cat}</span>
                      </div>
                      <span className="font-bold text-[#f0d48a]">{p.price}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="p-3 rounded-xl bg-[#1a1a24] border border-border">
                  <div className="text-xs font-bold text-[#f0d48a] mb-1">
                    Analyse du Chiffre d'Affaires
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Suivez vos pics de vente, plats les plus rentables et performances mensuelles.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#1a1a24]/80 border border-border space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Poulet Braisé (Top Vente)</span>
                    <span className="font-bold text-[#f0d48a]">42% des commandes</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0a0a0f] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#d4a853] to-[#f0d48a] w-[84%]" />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="muted-foreground text-muted-foreground">Poisson Grillé</span>
                    <span className="font-bold text-foreground">28% des commandes</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0a0a0f] overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[56%]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action inside Mockup */}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Inclus dans tous les plans
            </span>

            <Link
              to="/auth/inscription"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4a853] text-[#0a0a0f] font-bold text-xs hover:opacity-90 active:scale-95 transition-all"
            >
              Essayer gratuitement <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
