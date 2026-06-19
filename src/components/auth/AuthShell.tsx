import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Particles } from "@/components/landing/Particles";

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
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(212,168,83,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(212,168,83,0.10) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden="true" />
      <Particles count={6} />

      <div className={`relative z-10 w-full ${maxWidth}`}>
        <div className="relative rounded-3xl border border-white/10 bg-dark-card/90 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex w-16 h-16 rounded-2xl bg-gradient-gold items-center justify-center text-3xl font-black text-[#0a0a0f] shadow-gold mb-4">
              R
            </Link>
            <h1 className="text-2xl font-black text-gradient-gold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {children}
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-xs text-muted-foreground hover:text-gold transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
