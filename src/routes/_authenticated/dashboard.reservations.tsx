import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";

export const Route = createFileRoute("/_authenticated/dashboard/reservations")({
  component: ReservationsPage,
});

type Resa = {
  id: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  notes: string | null;
  status: string;
  created_at: string;
};

const STATUSES = [
  { id: "pending", label: "En attente", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { id: "confirmed", label: "Confirmée", color: "text-green-400 border-green-500/30 bg-green-500/10" },
  { id: "cancelled", label: "Annulée", color: "text-muted-foreground border-white/10" },
];

function ReservationsPage() {
  const { restaurant } = useMyRestaurant();
  const [list, setList] = useState<Resa[]>([]);

  const load = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true });
    setList((data ?? []) as Resa[]);
  };

  useEffect(() => { load(); }, [restaurant?.id]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    toast.success("Mis à jour");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette réservation ?")) return;
    await supabase.from("reservations").delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Réservations</p>
        <h1 className="text-3xl font-black">{list.length} réservation{list.length > 1 ? "s" : ""}</h1>
        {restaurant?.plan === "gratuit" && (
          <p className="mt-2 text-sm text-amber-400">Les réservations en ligne nécessitent un forfait Standard ou Premium.</p>
        )}
      </div>

      {list.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-white/10 text-center text-muted-foreground">
          Aucune réservation pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const st = STATUSES.find((s) => s.id === r.status) ?? STATUSES[0];
            return (
              <div key={r.id} className="p-5 rounded-2xl border border-white/8 bg-dark-card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg">{r.customer_name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      📅 {new Date(r.reservation_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à <strong className="text-foreground">{r.reservation_time.slice(0, 5)}</strong> · 👥 {r.party_size} pers. · 📱 <a href={`tel:${r.customer_phone}`} className="text-gold">{r.customer_phone}</a>
                    </p>
                    {r.notes && <p className="text-sm mt-2 italic text-muted-foreground">« {r.notes} »</p>}
                  </div>
                  <div className="flex gap-2">
                    {STATUSES.filter((s) => s.id !== r.status).map((s) => (
                      <button key={s.id} onClick={() => setStatus(r.id, s.id)} className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold hover:border-gold/40">
                        → {s.label}
                      </button>
                    ))}
                    <button onClick={() => remove(r.id)} className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs hover:bg-destructive/10">✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
