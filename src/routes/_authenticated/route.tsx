import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return { user: data.user };
      }
    } catch (err) {
      // Erreur de connexion Supabase
    }

    // Le staff se connecte par nom + PIN, pas par un compte Supabase —
    // une session staff valide (vérifiée au moment de la connexion via
    // staff_verify_pin) donne aussi accès au tableau de bord.
    if (typeof window !== "undefined") {
      const staffId = sessionStorage.getItem("staff_id");
      const staffName = sessionStorage.getItem("staff_name");
      const staffRole = sessionStorage.getItem("staff_role");
      if (staffId && staffName && staffRole) {
        return { staff: { id: staffId, name: staffName, role: staffRole } };
      }
    }

    throw redirect({ to: "/auth/connexion" });
  },
  component: () => <Outlet />,
});
