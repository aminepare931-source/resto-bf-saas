import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/debug-user")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Debug — User Info" }],
  }),
  component: DebugPage,
});

function DebugPage() {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      setUser({ id: u.user.id, email: u.user.email || "" });
      // Check role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (roleData) {
        setUser((prev) => (prev ? { ...prev, role: roleData.role } : null));
      }
    }
    setLoading(false);
  };

  const makeSuperAdmin = async () => {
    if (!user) return;
    setRoleLoading(true);
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, role: "super_admin" });
    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert("Rôle super_admin attribué ! Rafraîchis la page.");
      loadUser();
    }
    setRoleLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold text-foreground">Non connecté</p>
          <Link to="/auth/connexion" className="text-gold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-foreground">Debug — Infos Utilisateur</h1>

        <div className="p-6 rounded-2xl border border-white/10 bg-dark-card space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
            <p className="text-lg font-mono text-foreground">{user.email}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">User ID</p>
            <p className="text-sm font-mono text-gold break-all">{user.id}</p>
            <button
              onClick={() => navigator.clipboard.writeText(user.id)}
              className="mt-2 text-xs text-muted-foreground hover:text-gold underline"
            >
              Copier le user_id
            </button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Rôle actuel</p>
            <p className="text-lg font-bold text-foreground">{user.role || "Aucun rôle"}</p>
          </div>

          {user.role !== "super_admin" && (
            <button
              onClick={makeSuperAdmin}
              disabled={roleLoading}
              className="px-6 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold transition-all disabled:opacity-50"
            >
              {roleLoading ? "Attribution..." : "Devenir Super Admin"}
            </button>
          )}

          {user.role === "super_admin" && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 font-bold">✅ Tu es super admin !</p>
              <Link to="/super-admin" className="text-sm text-gold hover:underline mt-2 inline-block">
                Aller au Super Admin →
              </Link>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-foreground">
            <strong>Pour donner le rôle manuellement via SQL :</strong>
            <br />
            <code className="block mt-2 p-2 bg-black/20 rounded text-xs">
              INSERT INTO public.user_roles (user_id, role) VALUES ('{user.id}', 'super_admin')
              ON CONFLICT (user_id, role) DO NOTHING;
            </code>
          </p>
        </div>

        <Link to="/" className="text-sm text-muted-foreground hover:text-gold">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
