import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check local demo session first if present
    const demoUserStr =
      typeof window !== "undefined" ? localStorage.getItem("restobf_demo_user") : null;
    if (demoUserStr) {
      try {
        const demoUser = JSON.parse(demoUserStr);
        return { user: demoUser };
      } catch (e) {
        localStorage.removeItem("restobf_demo_user");
      }
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return { user: data.user };
      }
    } catch (err) {
      // Supabase connection error - fallback if in demo mode
    }

    throw redirect({ to: "/auth/connexion" });
  },
  component: () => <Outlet />,
});
