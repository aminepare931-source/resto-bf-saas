/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type FieldType = "text" | "textarea" | "number" | "bool";
type Field = { key: string; label: string; type?: FieldType; readOnly?: boolean };
type TableDef = { table: string; label: string; fields: Field[] };

/** Toutes les données métier que le super admin peut modérer / corriger / supprimer. */
const TABLES: TableDef[] = [
  {
    table: "menu_items",
    label: "Menus (plats)",
    fields: [
      { key: "name", label: "Nom" },
      { key: "category", label: "Catégorie" },
      { key: "price", label: "Prix (F)", type: "number" },
      { key: "available", label: "Disponible", type: "bool" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "position", label: "Position", type: "number" },
    ],
  },
  {
    table: "gallery_images",
    label: "Galerie (photos)",
    fields: [
      { key: "image_url", label: "Image", readOnly: true },
      { key: "caption", label: "Légende" },
      { key: "position", label: "Position", type: "number" },
    ],
  },
  {
    table: "reviews",
    label: "Avis clients",
    fields: [
      { key: "author_name", label: "Auteur" },
      { key: "rating", label: "Note", type: "number" },
      { key: "comment", label: "Commentaire", type: "textarea" },
      { key: "approved", label: "Publié", type: "bool" },
    ],
  },
  {
    table: "reservations",
    label: "Réservations",
    fields: [
      { key: "customer_name", label: "Client" },
      { key: "customer_phone", label: "Téléphone" },
      { key: "party_size", label: "Personnes", type: "number" },
      { key: "reservation_date", label: "Date" },
      { key: "reservation_time", label: "Heure" },
      { key: "status", label: "Statut" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    table: "orders",
    label: "Commandes",
    fields: [
      { key: "customer_name", label: "Client" },
      { key: "customer_phone", label: "Téléphone" },
      { key: "table_number", label: "Table" },
      { key: "total", label: "Total (F)", type: "number", readOnly: true },
      { key: "status", label: "Statut" },
      { key: "payment_status", label: "Paiement" },
      { key: "source", label: "Source", readOnly: true },
    ],
  },
  {
    table: "invoices",
    label: "Factures",
    fields: [
      { key: "invoice_number", label: "N°" },
      { key: "customer_name", label: "Client" },
      { key: "total", label: "Total (F)", type: "number", readOnly: true },
      { key: "status", label: "Statut" },
    ],
  },
  {
    table: "staff_members",
    label: "Personnel",
    fields: [
      { key: "name", label: "Nom" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Téléphone" },
      { key: "role", label: "Rôle" },
      { key: "is_active", label: "Actif", type: "bool" },
    ],
  },
  {
    table: "stock_items",
    label: "Stocks",
    fields: [
      { key: "name", label: "Article" },
      { key: "category", label: "Catégorie" },
      { key: "current_quantity", label: "Quantité", type: "number" },
      { key: "min_quantity", label: "Seuil", type: "number" },
      { key: "unit", label: "Unité" },
      { key: "status", label: "Statut" },
    ],
  },
  {
    table: "restaurant_tables",
    label: "Tables (plan de salle)",
    fields: [
      { key: "number", label: "Numéro" },
      { key: "zone", label: "Zone" },
      { key: "capacity", label: "Places", type: "number" },
      { key: "status", label: "Statut" },
    ],
  },
  {
    table: "payment_codes",
    label: "Codes de paiement",
    fields: [
      { key: "code", label: "Code", readOnly: true },
      { key: "amount", label: "Montant", type: "number" },
      { key: "method", label: "Méthode" },
      { key: "status", label: "Statut" },
      { key: "used", label: "Utilisé", type: "bool" },
    ],
  },
  {
    table: "chat_messages",
    label: "Messagerie interne",
    fields: [
      { key: "sender_name", label: "Expéditeur" },
      { key: "sender_role", label: "Rôle" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "read", label: "Lu", type: "bool" },
    ],
  },
];

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-surface-warm border border-input text-sm focus:border-gold/40 outline-none";

type Row = Record<string, any>;

function cell(v: unknown, f: Field) {
  if (v === null || v === undefined || v === "") return "—";
  if (f.type === "bool") return v ? "oui" : "non";
  const s = String(v);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}

export function DataManager({ restos }: { restos: { id: string; name: string }[] }) {
  const [tableKey, setTableKey] = React.useState(TABLES[0].table);
  const [restoId, setRestoId] = React.useState("");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [edit, setEdit] = React.useState<Row | null>(null);

  const def = TABLES.find((t) => t.table === tableKey)!;
  const restoName = (id: string) => restos.find((r) => r.id === id)?.name ?? "—";

  const load = React.useCallback(async () => {
    setLoading(true);
    let query = (supabase.from(tableKey as never) as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (restoId) query = query.eq("restaurant_id", restoId);
    const { data, error } = await query;
    setLoading(false);
    if (error) {
      toast.error(error.message);
      setRows([]);
      return;
    }
    setRows((data ?? []) as Row[]);
  }, [tableKey, restoId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = rows.filter((r) =>
    !q ? true : JSON.stringify(r).toLowerCase().includes(q.toLowerCase()),
  );

  const remove = async (r: Row) => {
    if (!window.confirm("Supprimer définitivement cette ligne ?")) return;
    const { error } = await (supabase.from(tableKey as never) as any).delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé");
    setRows((prev) => prev.filter((x) => x.id !== r.id));
  };

  const save = async () => {
    if (!edit) return;
    const patch: Row = {};
    for (const f of def.fields) {
      if (f.readOnly) continue;
      let v = edit[f.key];
      if (f.type === "number") v = v === "" || v === null ? null : Number(v);
      patch[f.key] = v;
    }
    const { error } = await (supabase.from(tableKey as never) as any)
      .update(patch)
      .eq("id", edit.id);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    setEdit(null);
    void load();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          className={`${inputCls} max-w-[220px]`}
          value={tableKey}
          onChange={(e) => setTableKey(e.target.value)}
        >
          {TABLES.map((t) => (
            <option key={t.table} value={t.table}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className={`${inputCls} max-w-[220px]`}
          value={restoId}
          onChange={(e) => setRestoId(e.target.value)}
        >
          <option value="">Tous les restaurants</option>
          {restos.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Rechercher…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg border border-border text-sm font-semibold"
        >
          Actualiser
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {loading ? "Chargement…" : `${filtered.length} ligne(s) — ${def.label}`} (300 plus récentes)
      </p>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="p-3">Restaurant</th>
              {def.fields.map((f) => (
                <th key={f.key} className="p-3">
                  {f.label}
                </th>
              ))}
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-border/50 align-top">
                <td className="p-3 text-xs font-semibold">{restoName(r.restaurant_id)}</td>
                {def.fields.map((f) => (
                  <td key={f.key} className="p-3 text-xs">
                    {cell(r[f.key], f)}
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => setEdit({ ...r })}
                      className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => remove(r)}
                      className="px-2.5 py-1 rounded-lg border border-destructive/40 text-destructive text-xs font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={def.fields.length + 2}
                  className="p-6 text-center text-muted-foreground"
                >
                  Aucune donnée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {edit && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-3"
          onClick={() => setEdit(null)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black mb-1">Modifier — {def.label}</h3>
            <p className="text-xs text-muted-foreground mb-4">{restoName(edit.restaurant_id)}</p>
            <div className="grid gap-3">
              {def.fields.map((f) => (
                <label key={f.key}>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                    {f.label}
                  </span>
                  {f.type === "bool" ? (
                    <input
                      type="checkbox"
                      checked={!!edit[f.key]}
                      onChange={(e) => setEdit({ ...edit, [f.key]: e.target.checked })}
                    />
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={edit[f.key] ?? ""}
                      onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      type={f.type === "number" ? "number" : "text"}
                      disabled={f.readOnly}
                      value={edit[f.key] ?? ""}
                      onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEdit(null)}
                className="px-4 py-2 rounded-xl border border-border text-sm font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="px-5 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] text-sm font-black"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
