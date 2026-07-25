import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Particles } from "@/components/landing/Particles";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useRef } from "react";
import { Sparkles, ShieldCheck, ArrowLeft, LogIn, UserPlus, ChefHat } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  const location = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Motion values for Card tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const spotX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const spotY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const pathname = location.pathname;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden text-foreground selection:bg-[#d4a853]/30">
      {/* Dynamic Background Glow Auroras */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(212,168,83,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(240,212,138,0.2) 0%, transparent 65%)",
        }}
      />
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none -z-10" />
      <Particles count={8} />

      {/* Top Header Return Button */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111118]/80 hover:bg-[#1a1a24] border border-[#d4a853]/30 text-xs font-bold text-foreground hover:text-[#f0d48a] transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#d4a853]" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4a853]/15 border border-[#d4a853]/30 text-[11px] font-semibold text-[#f0d48a]">
          <Sparkles className="w-3 h-3 text-[#d4a853]" />
          <span>SaaS Resto BF — Burkina Faso</span>
        </div>
      </div>

      {/* Main 3D Interactive Container */}
      <div className={`relative z-10 w-full ${maxWidth}`}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            perspective: 1200,
          }}
          className="relative rounded-3xl border border-[#d4a853]/40 bg-[#111118]/95 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden group"
        >
          {/* Specular Light Spotlight following mouse */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(350px circle at ${spotX} ${spotY}, rgba(212,168,83,0.25), transparent 80%)`,
            }}
          />

          {/* Golden Top Border Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853] to-transparent opacity-80" />

          {/* Header Branding */}
          <div className="text-center mb-6 relative z-20">
            <Link to="/" className="inline-block relative mb-3 group/logo">
              <div className="absolute -inset-2 rounded-2xl bg-[#d4a853]/30 blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
              <img
                src="/restobf-logo.png"
                alt="Resto BF"
                width={72}
                height={72}
                className="relative w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-2xl object-contain border border-[#d4a853]/40 bg-[#0a0a0f] p-1.5 shadow-xl group-hover/logo:scale-105 transition-transform"
              />
            </Link>

            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4a853] via-[#f0d48a] to-[#b08800] tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{subtitle}</p>

            {/* Quick Auth Navigation Tabs */}
            <div className="mt-5 inline-flex p-1 rounded-xl bg-[#0a0a0f] border border-border text-xs font-semibold gap-1 max-w-full overflow-x-auto">
              <Link
                to="/auth/connexion"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pathname.includes("/connexion")
                    ? "bg-[#d4a853] text-[#0a0a0f] font-bold shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </Link>

              <Link
                to="/auth/inscription"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pathname.includes("/inscription")
                    ? "bg-[#d4a853] text-[#0a0a0f] font-bold shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscription</span>
              </Link>

              <Link
                to="/auth/staff-login"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pathname.includes("/staff-login")
                    ? "bg-[#d4a853] text-[#0a0a0f] font-bold shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#1a1a24]"
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Staff / Cuisine</span>
              </Link>
            </div>
          </div>

          {/* Form / Content Slot */}
          <div className="relative z-20">{children}</div>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-medium relative z-20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Connexion 100% sécurisée & données chiffrées au Burkina</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
