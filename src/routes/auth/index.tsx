import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Connexion — Resto BF" },
      { name: "description", content: "Accédez à votre espace Resto BF" },
    ],
  }),
  component: AuthHomePage,
});

function AuthHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/restobf-logo.png" alt="RestoBF" className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white object-contain p-2 shadow-gold" />
          <h1 className="text-4xl font-black mb-2">Bienvenue sur Resto BF</h1>
          <p className="text-muted-foreground">
            Choisissez votre espace pour continuer
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/auth/inscription"
            className="block p-6 rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent hover:border-gold/50 hover:shadow-gold transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">👨‍💼</div>
              <div className="flex-1">
                <h2 className="text-xl font-black mb-1 group-hover:text-gold transition-colors">
                  Je suis restaurateur
                </h2>
                <p className="text-sm text-muted-foreground">
                  Je veux gérer mon restaurant, mes commandes et mes réservations
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/auth/staff-login"
            className="block p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">👨‍🍳</div>
              <div className="flex-1">
                <h2 className="text-xl font-black mb-1 group-hover:text-foreground transition-colors">
                  Je suis cuisinier / staff
                </h2>
                <p className="text-sm text-muted-foreground">
                  Je veux accéder à l'espace cuisine ou service
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 p-4 rounded-xl border border-white/8 bg-white/[0.02]">
          <p className="text-xs text-center text-muted-foreground">
            En vous connectant, vous acceptez nos{" "}
            <a href="#contact" className="text-gold font-bold">conditions générales</a>
            {" "}et notre{" "}
            <a href="#contact" className="text-gold font-bold">politique de confidentialité</a>
          </p>
        </div>
      </div>
    </div>
  );
}