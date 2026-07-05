import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "Hors ligne — Resto BF" },
      { name: "description", content: "Vous êtes actuellement hors ligne." },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
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

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="rounded-3xl border border-white/10 bg-dark-card/90 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-gold flex items-center justify-center text-4xl mb-6 shadow-gold">
            📡
          </div>
          <h1 className="text-2xl font-black text-gradient-gold mb-3">
            Vous êtes hors ligne
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Pas de panique ! Les pages que vous avez déjà visitées sont
            disponibles. Dès que la connexion reviendra, tout se
            synchronisera automatiquement.
          </p>

          <div className="space-y-3 text-left bg-white/[0.03] rounded-2xl p-5 border border-white/5 mb-6">
            <p className="text-xs font-bold text-gold uppercase tracking-wider">
              ✅ Disponible hors ligne
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Menu et plats du restaurant
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Pages déjà visitées
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Images déjà téléchargées
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Paramètres enregistrés
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">✓</span> Navigation dans l'application
              </li>
            </ul>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-gradient-gold text-[#0a0a0f] font-bold shadow-gold hover:-translate-y-0.5 transition-transform w-full"
          >
            ← Retour à l'accueil
          </Link>

          <p className="mt-4 text-xs text-muted-foreground">
            <button
              onClick={() => window.location.reload()}
              className="text-gold hover:underline"
            >
              Réessayer la connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}