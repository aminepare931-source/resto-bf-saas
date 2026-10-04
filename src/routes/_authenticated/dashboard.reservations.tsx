import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { announceNewReservation } from "@/lib/voice";
import { Calendar, Users, Phone } from "lucide-react";

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
  {
    id: "pending",
    label: "En attente",
    color: "text-amber-deep border-amber-brand/40 bg-amber-tint",
  },
  {
    id: "confirmed",
    label: "Confirmée",
    color: "text-emerald-deep border-emerald/30 bg-emerald-tint",
  },
  { id: "cancelled", label: "Annulée", color: "text-muted-foreground border-border" },
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

  useEffect(() => {
    load();
  }, [restaurant?.id]);

  // Nouvelles réservations en temps réel + annonce vocale
  useEffect(() => {
    if (!restaurant) return;
    const channel = supabase
      .channel(`reservations-${restaurant.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reservations",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          const resa = payload.new as unknown as Resa;
          setList((prev) => [resa, ...prev]);
          toast.success(
            `Nouvelle réservation · ${resa.party_size} pers. · ${resa.reservation_time}`,
          );
          announceNewReservation({
            customerName: resa.customer_name,
            guests: resa.party_size,
            time: resa.reservation_time,
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id]);

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

  const sendWhatsAppConfirmation = async (reservation: Resa) => {
    if (!restaurant?.whatsapp) {
      toast.error("Configurez votre numéro WhatsApp dans Paramètres");
      return;
    }

    const channel = restaurant.notification_reservations_channel || "both";

    const msg =
      `Bonjour ${reservation.customer_name} !\n\n` +
      `Votre réservation pour le ${new Date(reservation.reservation_date).toLocaleDateString("fr-FR")} à ${reservation.reservation_time} a bien été enregistrée.\n\n` +
      `Détails :\n` +
      `• Nombre de personnes : ${reservation.party_size}\n` +
      (reservation.notes ? `• Notes : ${reservation.notes}\n` : "") +
      `\nNous vous attendons avec impatience !\n\n` +
      `RestoBF`;

    if (channel === "whatsapp" || channel === "both") {
      const cleanPhone = reservation.customer_phone.replace(/\D/g, "");
      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, "_blank");
      toast.success("Message de confirmation WhatsApp ouvert");
    } else {
      toast.success("Réservation confirmée dans le panneau admin");
    }

    await setStatus(reservation.id, "confirmed");
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-terracotta font-bold mb-2">
          Réservations
        </p>
        <h1 className="text-3xl font-black">
          {list.length} réservation{list.length > 1 ? "s" : ""}
        </h1>
      </div>

      {list.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
          Aucune réservation pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const st = STATUSES.find((s) => s.id === r.status) ?? STATUSES[0];
            return (
              <div key={r.id} className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg">{r.customer_name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 inline-flex items-center gap-1.5 flex-wrap">
                      <Calendar className="w-3.5 h-3.5 text-terracotta" />
                      {new Date(r.reservation_date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      à{" "}
                      <strong className="text-foreground">{r.reservation_time.slice(0, 5)}</strong>
                      <span className="mx-1 text-border">·</span>
                      <Users className="w-3.5 h-3.5 text-terracotta" /> {r.party_size} pers.
                      <span className="mx-1 text-border">·</span>
                      <Phone className="w-3.5 h-3.5 text-terracotta" />
                      <a
                        href={`tel:${r.customer_phone}`}
                        className="text-terracotta-deep hover:underline"
                      >
                        {r.customer_phone}
                      </a>
                    </p>
                    {r.notes && (
                      <p className="text-sm mt-2 italic text-muted-foreground">« {r.notes} »</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {STATUSES.filter((s) => s.id !== r.status).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStatus(r.id, s.id)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-warm transition-colors"
                      >
                        → {s.label}
                      </button>
                    ))}
                    {r.status === "pending" && (
                      <button
                        onClick={() => sendWhatsAppConfirmation(r)}
                        className="px-3 py-1.5 rounded-lg bg-emerald text-white text-xs font-semibold hover:bg-emerald-deep transition-colors"
                      >
                        ✓ Confirmer + WhatsApp
                      </button>
                    )}
                    <button
                      onClick={() => remove(r.id)}
                      className="px-3 py-1.5 rounded-lg border border-destructive/20 text-destructive/80 text-xs hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-colors"
                    >
                      ✕
                    </button>
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
