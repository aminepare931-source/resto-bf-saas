import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/tables")({
  component: TablesPage,
});

type Table = {
  id: string;
  restaurant_id: string;
  number: string;
  capacity: number;
  zone: string | null;
  status: "free" | "occupied" | "reserved" | "cleaning";
  position: number;
};

const STATUS_COLORS: Record<Table["status"], string> = {
  free: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  occupied: "bg-red-500/10 border-red-500/30 text-red-300",
  reserved: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  cleaning: "bg-blue-500/10 border-blue-500/30 text-blue-300",
};
const STATUS_LABEL: Record<Table["status"], string> = {
  free: "Libre",
  occupied: "Occupée",
  reserved: "Réservée",
  cleaning: "Nettoyage",
};

function TablesPage() {
  const { restaurant: r } = useMyRestaurant();
  const [tables, setTables] = useState<Table[]>([]);
  const [form, setForm] = useState({ number: "", capacity: 2, zone: "" });

  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("restaurant_tables" as never)
        .select("*")
        .eq("restaurant_id", r.id)
        .order("position");
      if (!cancelled && data) setTables(data as unknown as Table[]);
    })();

    const channel = supabase
      .channel(`tables-${r.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_tables", filter: `restaurant_id=eq.${r.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") setTables((p) => [...p, payload.new as unknown as Table]);
          else if (payload.eventType === "UPDATE") setTables((p) => p.map((t) => (t.id === (payload.new as Table).id ? (payload.new as unknown as Table) : t)));
          else if (payload.eventType === "DELETE") setTables((p) => p.filter((t) => t.id !== (payload.old as Table).id));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [r]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!r) return;
    if (!form.number.trim()) return toast.error("Numéro requis");
    const { error } = await supabase
      .from("restaurant_tables" as never)
      .insert({
        restaurant_id: r.id,
        number: form.number.trim().slice(0, 20),
        capacity: Math.max(1, Math.min(50, Number(form.capacity) || 2)),
        zone: form.zone.trim().slice(0, 50) || null,
        position: tables.length,
      } as never);
    if (error) return toast.error(error.message);
    setForm({ number: "", capacity: 2, zone: "" });
    toast.success("Table ajoutée");
  };

  const setStatus = async (t: Table, status: Table["status"]) => {
    const { error } = await supabase
      .from("restaurant_tables" as never)
      .update({ status } as never)
      .eq("id", t.id);
    if (error) toast.error(error.message);
  };

  const remove = async (t: Table) => {
    if (!confirm(`Supprimer la table ${t.number} ?`)) return;
    const { error } = await supabase.from("restaurant_tables" as never).delete().eq("id", t.id);
    if (error) toast.error(error.message);
  };

  if (!r) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Tables</p>
        <h1 className="text-3xl font-black">Plan de salle</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Suivez en direct l'état de chaque table. Imprimez un QR par table depuis l'onglet « QR Code ».
        </p>
      </div>

      <form onSubmit={add} className="p-4 rounded-2xl border border-white/8 bg-dark-card mb-6 grid sm:grid-cols-[1fr_120px_1fr_auto] gap-3 items-end">
        <Field label="Numéro de table">
          <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="12 ou A1" className="input" />
        </Field>
        <Field label="Capacité">
          <input type="number" min={1} max={50} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="input" />
        </Field>
        <Field label="Zone (optionnel)">
          <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Terrasse, Salon VIP…" className="input" />
        </Field>
        <button className="px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm">+ Ajouter</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tables.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 p-10 text-center rounded-2xl border border-dashed border-white/10 text-muted-foreground">
            Aucune table. Ajoutez votre première table ci-dessus.
          </div>
        )}
        {tables.map((t) => (
          <div key={t.id} className={`p-5 rounded-2xl border ${STATUS_COLORS[t.status]}`}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <strong className="text-2xl block">Table {t.number}</strong>
                <span className="text-xs opacity-80">{t.capacity} pers.{t.zone ? ` · ${t.zone}` : ""}</span>
              </div>
              <button onClick={() => remove(t)} className="text-white/30 hover:text-red-400 text-lg">×</button>
            </div>
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-3">
              {STATUS_LABEL[t.status]}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(STATUS_LABEL) as Table["status"][]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(t, s)}
                  disabled={t.status === s}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold border border-white/10 hover:bg-white/5 disabled:opacity-40"
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`.input{width:100%;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#e8e6e3;font-size:14px;outline:none;}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}