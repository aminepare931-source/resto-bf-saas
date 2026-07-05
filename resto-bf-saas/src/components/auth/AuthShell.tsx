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
            <Link to="/" className="inline-flex w-20 h-20 rounded-2xl items-center justify-center mb-4 group">
              <img src="/restobf-logo.png" alt="Resto BF" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
            </Link>
            <h1 className="text-2xl font-black text-gradient-gold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-semibold">Connexion sécurisée</span>
            </div>
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
