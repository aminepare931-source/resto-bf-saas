import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsSuperAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        if (mounted) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      if (mounted) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { isAdmin, loading };
}

export function useSuperAdminExists() {
  const [exists, setExists] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.rpc("super_admin_exists").then(({ data }) => setExists(!!data));
  }, []);
  return exists;
}
