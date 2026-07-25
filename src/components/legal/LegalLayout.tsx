import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(212,168,83,0.14) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(212,168,83,0.08) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden="true" />

      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/restobf-logo.png" alt="RestoBF" className="w-8 h-8 object-contain" />
            <strong className="text-sm font-bold">RestoBF</strong>
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-gold transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">Resto BF</p>
        <h1 className="text-3xl sm:text-4xl font-black mb-2">{title}</h1>
        <p className="text-xs text-muted-foreground mb-10">Dernière mise à jour : {updated}</p>

        <div className="legal-content space-y-8 text-sm leading-relaxed text-foreground/90">
          {children}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <Link
            to="/confidentialite"
            className="text-muted-foreground hover:text-gold transition-colors"
          >
            Confidentialité
          </Link>
          <Link
            to="/conditions"
            className="text-muted-foreground hover:text-gold transition-colors"
          >
            Conditions d'utilisation
          </Link>
          <Link
            to="/mentions-legales"
            className="text-muted-foreground hover:text-gold transition-colors"
          >
            Mentions légales
          </Link>
        </div>
      </main>
    </div>
  );
}

export function LSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gold mb-3">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  );
}
