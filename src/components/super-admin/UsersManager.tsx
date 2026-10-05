/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AdminUser = {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_super_admin: boolean;
  restaurants_count: number;
};

export function UsersManager() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [me, setMe] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.rpc as any)("admin_list_users");
    setLoading(false);
    if (error) {
      toast.error(
        error.message?.includes("admin_list_users")
          ? "Migration SQL non appliquée (admin_list_users introuvable)"
          : error.message,
      );
      return;
    }
    setUsers((data ?? []) as AdminUser[]);
  }, []);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
    void load();
  }, [load]);

  const setAdmin = async (u: AdminUser, grant: boolean) => {
    if (!window.confirm(`${grant ? "Donner" : "Retirer"} le rôle super admin à ${u.email} ?`))
      return;
    const { error } = await (supabase.rpc as any)("admin_set_super_admin", {
      _user_id: u.user_id,
      _grant: grant,
    });
    if (error) return toast.error(error.message);
    toast.success("Rôle mis à jour");
    void load();
  };

  const remove = async (u: AdminUser) => {
    const typed = window.prompt(
      `Supprimer le compte ${u.email} et ses ${u.restaurants_count} restaurant(s) ?\nTapez l'e-mail pour confirmer :`,
    );
    if (typed === null) return;
    if (typed.trim().toLowerCase() !== u.email.toLowerCase())
      return toast.error("E-mail incorrect, annulé");
    const { error } = await (supabase.rpc as any)("admin_delete_user", { _user_id: u.user_id });
    if (error) return toast.error(error.message);
    toast.success("Compte supprimé");
    void load();
  };

  const list = users.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un e-mail…"
          className="w-full max-w-md px-4 py-2.5 rounded-xl bg-surface-warm border border-input text-sm focus:border-gold/40 outline-none"
        />
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg border border-border text-sm font-semibold"
        >
          Actualiser
        </button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="p-3">E-mail</th>
                <th className="p-3">Inscrit le</th>
                <th className="p-3">Dernière connexion</th>
                <th className="p-3">Restos</th>
                <th className="p-3">Rôle</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.user_id} className="border-b border-border/50">
                  <td className="p-3 font-semibold">{u.email}</td>
                  <td className="p-3 text-xs">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3 text-xs">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="p-3 text-xs">{u.restaurants_count}</td>
                  <td className="p-3 text-xs font-bold uppercase">
                    {u.is_super_admin ? "super admin" : "client"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5 justify-end">
                      {u.is_super_admin ? (
                        <button
                          disabled={u.user_id === me}
                          onClick={() => setAdmin(u, false)}
                          className="px-2.5 py-1 rounded-lg border border-amber-brand/40 text-amber-deep text-xs font-semibold disabled:opacity-40"
                        >
                          Retirer admin
                        </button>
                      ) : (
                        <button
                          onClick={() => setAdmin(u, true)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold"
                        >
                          Nommer admin
                        </button>
                      )}
                      <button
                        disabled={u.user_id === me}
                        onClick={() => remove(u)}
                        className="px-2.5 py-1 rounded-lg border border-destructive/40 text-destructive text-xs font-semibold disabled:opacity-40"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Aucun compte.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
