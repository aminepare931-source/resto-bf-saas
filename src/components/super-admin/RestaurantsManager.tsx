/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type AdminResto = {
  id: string;
  name: string;
  slug: string | null;
  city: string;
  cuisine: string | null;
  plan: string;
  template: string | null;
  email: string;
  phone: string;
  owner_name: string;
  created_at: string;
  subscription_status: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
};

const PLANS = ["trial", "basique", "standard", "premium", "sur_mesure", "gratuit"];
const STATUSES = ["trial", "active", "expired", "suspended", "cancelled"];
const TEMPLATES = [
  "gratuit-classique",
  "std-soleil",
  "std-savane",
  "std-marche",
  "std-moderne",
  "prem-royal",
  "prem-nuit",
  "prem-feu",
  "prem-luxe",
];

type Row = Record<string, any>;

const FIELDS: {
  key: string;
  label: string;
  type?: "text" | "textarea" | "bool" | "date" | "select";
  options?: string[];
}[] = [
  { key: "name", label: "Nom" },
  { key: "slug", label: "Slug (adresse du site)" },
  { key: "owner_name", label: "Gérant" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Téléphone" },
  { key: "whatsapp", label: "WhatsApp (chiffres seulement)" },
  { key: "city", label: "Ville" },
  { key: "address", label: "Adresse" },
  { key: "cuisine", label: "Cuisine" },
  { key: "hours", label: "Horaires", type: "textarea" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "plan", label: "Forfait", type: "select", options: PLANS },
  { key: "subscription_status", label: "Statut abonnement", type: "select", options: STATUSES },
  { key: "template", label: "Template", type: "select", options: TEMPLATES },
  { key: "trial_ends_at", label: "Fin d'essai", type: "date" },
  { key: "subscription_ends_at", label: "Fin d'abonnement", type: "date" },
  { key: "offers_delivery", label: "Propose la livraison", type: "bool" },
];

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-surface-warm border border-input text-sm focus:border-gold/40 outline-none";

function toDateInput(v: string | null | undefined) {
  return v ? new Date(v).toISOString().slice(0, 10) : "";
}

export function RestaurantsManager({
  restos,
  onChange,
}: {
  restos: AdminResto[];
  onChange: () => void;
}) {
  const [q, setQ] = React.useState("");
  const [editId, setEditId] = React.useState<string | null>(null);

  const list = restos.filter((r) =>
    `${r.name} ${r.city} ${r.email} ${r.owner_name} ${r.slug ?? ""}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  const setStatus = async (r: AdminResto, status: string) => {
    const patch: Record<string, unknown> = { subscription_status: status };
    if (status === "active" && !r.subscription_ends_at) {
      const ends = new Date();
      ends.setMonth(ends.getMonth() + 1);
      patch.subscription_ends_at = ends.toISOString();
    }
    const { error } = await supabase
      .from("restaurants")
      .update(patch as never)
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${r.name} : ${status}`);
    onChange();
  };

  const remove = async (r: AdminResto) => {
    const typed = window.prompt(
      `Supprimer définitivement « ${r.name} » (menu, photos, avis, commandes…) ?\nTapez le nom exact pour confirmer :`,
    );
    if (typed === null) return;
    if (typed.trim() !== r.name) return toast.error("Nom incorrect, suppression annulée");
    const { error } = await supabase.from("restaurants").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Restaurant supprimé");
    onChange();
  };

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher (nom, ville, e-mail, gérant, slug)..."
        className={`${inputCls} max-w-md mb-5`}
      />
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="p-3">Restaurant</th>
              <th className="p-3">Gérant</th>
              <th className="p-3">Forfait</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Fin</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const end =
                r.subscription_status === "trial" ? r.trial_ends_at : r.subscription_ends_at;
              return (
                <tr key={r.id} className="border-b border-border/50 align-top">
                  <td className="p-3">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.city} · {r.email}
                    </div>
                    {r.slug && (
                      <a
                        href={`/${r.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gold underline"
                      >
                        /{r.slug}
                      </a>
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    {r.owner_name}
                    <div className="text-muted-foreground">{r.phone}</div>
                  </td>
                  <td className="p-3 text-xs uppercase font-bold">{r.plan}</td>
                  <td className="p-3 text-xs uppercase font-bold">
                    {r.subscription_status ?? "—"}
                  </td>
                  <td className="p-3 text-xs">
                    {end ? new Date(end).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <button
                        onClick={() => setEditId(r.id)}
                        className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold hover:border-gold/50"
                      >
                        Modifier
                      </button>
                      {r.subscription_status === "suspended" ? (
                        <button
                          onClick={() => setStatus(r, "active")}
                          className="px-2.5 py-1 rounded-lg border border-emerald/40 text-emerald-deep text-xs font-semibold"
                        >
                          Réactiver
                        </button>
                      ) : (
                        <button
                          onClick={() => setStatus(r, "suspended")}
                          className="px-2.5 py-1 rounded-lg border border-amber-brand/40 text-amber-deep text-xs font-semibold"
                        >
                          Suspendre
                        </button>
                      )}
                      <button
                        onClick={() => remove(r)}
                        className="px-2.5 py-1 rounded-lg border border-destructive/40 text-destructive text-xs font-semibold"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Aucun restaurant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editId && (
        <EditRestaurant
          id={editId}
          onClose={() => setEditId(null)}
          onSaved={() => {
            setEditId(null);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function EditRestaurant({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [row, setRow] = React.useState<Row | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error(error?.message ?? "Restaurant introuvable");
          onClose();
          return;
        }
        setRow(data as Row);
      });
  }, [id, onClose]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const patch: Row = {};
    for (const f of FIELDS) {
      let v = row[f.key];
      if (f.type === "date") v = v ? new Date(`${v.slice(0, 10)}T23:59:59`).toISOString() : null;
      if (typeof v === "string" && v === "" && f.type !== "textarea") v = null;
      patch[f.key] = v;
    }
    // champs obligatoires : on ne les met pas à null
    for (const k of [
      "name",
      "city",
      "email",
      "phone",
      "owner_name",
      "plan",
      "subscription_status",
    ]) {
      if (patch[k] === null) delete patch[k];
    }
    const { error } = await supabase
      .from("restaurants")
      .update(patch as never)
      .eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Restaurant mis à jour");
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black mb-4">Modifier le restaurant</h3>
        {!row ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <label key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                  {f.label}
                </span>
                {f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={row[f.key] ?? ""}
                    onChange={(e) => setRow({ ...row, [f.key]: e.target.value })}
                  />
                ) : f.type === "bool" ? (
                  <input
                    type="checkbox"
                    checked={!!row[f.key]}
                    onChange={(e) => setRow({ ...row, [f.key]: e.target.checked })}
                  />
                ) : f.type === "select" ? (
                  <select
                    className={inputCls}
                    value={row[f.key] ?? ""}
                    onChange={(e) => setRow({ ...row, [f.key]: e.target.value })}
                  >
                    {f.key === "template" && <option value="">(par défaut du forfait)</option>}
                    {f.options!.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    className={inputCls}
                    value={toDateInput(row[f.key])}
                    onChange={(e) => setRow({ ...row, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    className={inputCls}
                    value={row[f.key] ?? ""}
                    onChange={(e) => setRow({ ...row, [f.key]: e.target.value })}
                  />
                )}
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-sm font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={!row || saving}
            className="px-5 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] text-sm font-black disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
