import { createFileRoute, Link } from "@tanstack/react-router";
import { Store, ChefHat } from "lucide-react";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Connexion — RestoBF" },
      { name: "description", content: "Accédez à votre espace RestoBF" },
    ],
  }),
  component: AuthHomePage,
});

function AuthHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/restobf-logo.png"
            alt="RestoBF"
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white object-contain p-2 shadow-card"
          />
          <h1 className="text-4xl font-black mb-2">Bienvenue sur RestoBF</h1>
          <p className="text-muted-foreground">Choisissez votre espace pour continuer</p>
        </div>

        <div className="space-y-4">
          <Link
            to="/auth/inscription"
            className="block p-6 rounded-2xl border-2 border-terracotta/30 bg-gradient-to-br from-terracotta-tint to-transparent hover:border-terracotta/50 hover:shadow-elevated transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-terracotta-tint border border-terracotta/25 flex items-center justify-center text-terracotta shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black mb-1 group-hover:text-terracotta-deep transition-colors">
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
            className="block p-6 rounded-2xl border border-border bg-card hover:border-terracotta/40 hover:bg-muted transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-tint border border-emerald/25 flex items-center justify-center text-emerald-deep shrink-0">
                <ChefHat className="w-6 h-6" />
              </div>
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

        <div className="mt-8 p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-center text-muted-foreground">
            En vous connectant, vous acceptez nos{" "}
            <a href="#contact" className="text-terracotta-deep font-bold">
              conditions générales
            </a>{" "}
            et notre{" "}
            <a href="#contact" className="text-terracotta-deep font-bold">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
