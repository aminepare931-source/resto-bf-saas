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
      // Attendre un peu pour que Supabase traite le callback OAuth
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Récupérer la session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        toast.error("Erreur lors de la connexion");
        window.location.href = "/auth/connexion";
        return;
      }

      if (data.session) {
        toast.success("Connexion réussie !");
        // Rediriger vers le dashboard
        window.location.href = "/dashboard";
      } else {
        // Pas de session, essayer de récupérer l'utilisateur
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error("Pas de session ou d'utilisateur:", userError);
          window.location.href = "/auth/connexion";
          return;
        }
        
        // L'utilisateur existe mais pas de session, rediriger vers le dashboard
        window.location.href = "/dashboard";
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