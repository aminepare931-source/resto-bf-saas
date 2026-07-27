import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        // Attendre un peu pour que Supabase traite le callback OAuth
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Récupérer la session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          const errorMessage = error.message || "Erreur lors de la connexion";
          toast.error(errorMessage);
          setTimeout(() => {
            window.location.href = "/auth/connexion?error=" + encodeURIComponent(errorMessage);
          }, 2000);
          return;
        }

        if (data.session) {
          toast.success("Connexion réussie !");
          // Rediriger vers le dashboard
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        } else {
          // Pas de session, essayer de récupérer l'utilisateur
          const { data: userData, error: userError } = await supabase.auth.getUser();

          if (userError || !userData.user) {
            console.error("Pas de session ou d'utilisateur:", userError);
            const errorMsg = userError?.message || "Session expirée ou invalide";
            toast.error(errorMsg);
            setTimeout(() => {
              window.location.href = "/auth/connexion?error=" + encodeURIComponent(errorMsg);
            }, 2000);
            return;
          }

          // L'utilisateur existe mais pas de session, rediriger vers le dashboard
          toast.success("Connexion réussie !");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        }
      } catch (err: any) {
        console.error("Erreur dans le callback:", err);
        const errorMessage = err?.message || "Une erreur est survenue lors de la connexion";
        toast.error(errorMessage);
        setTimeout(() => {
          window.location.href = "/auth/connexion?error=" + encodeURIComponent(errorMessage);
        }, 2000);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}
