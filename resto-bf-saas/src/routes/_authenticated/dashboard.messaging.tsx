import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";
import { Phone, User, Calendar, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/messaging")({
  component: MessagingPage,
});

type Reservation = any;
type Order = any;

type Tab = "reservations" | "orders";

function MessagingPage() {
  const { restaurant: r } = useMyRestaurant();
  const [activeTab, setActiveTab] = useState<Tab>("reservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (r) {
      loadData();
    }
  }, [r?.id]);

  const loadData = async () => {
    if (!r) return;

    try {
      setLoading(true);

      const { data: reservationsData } = await supabase
        .from("reservations")
        .select("*")
        .eq("restaurant_id", r.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setReservations((reservationsData || []) as any[]);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, total, status, created_at")
        .eq("restaurant_id", r.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setOrders((ordersData || []) as any[]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phone: string, msg: string) => {
    if (!r?.whatsapp) {
      toast.error("Configurez votre numéro WhatsApp dans Paramètres");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, "_blank");
  };

  const sendConfirmation = (reservation: any) => {
    const msg = `Bonjour ${reservation.customer_name} !\n\n` +
      `Votre réservation pour le ${new Date(reservation.reservation_date).toLocaleDateString("fr-FR")} à ${reservation.reservation_time} a bien été enregistrée.\n\n` +
      `Détails :\n` +
      `• Nombre de personnes : ${reservation.party_size}\n` +
      (reservation.occasion ? `• Occasion : ${reservation.occasion}\n` : "") +
      (reservation.budget ? `• Budget : ${reservation.budget}\n` : "") +
      `\nNous vous attendons avec impatience !\n\n` +
      `Resto BF`;

    openWhatsApp(reservation.customer_phone, msg);
    toast.success("Message de confirmation ouvert");
  };

  const sendReminder = (reservation: any) => {
    const msg = `Bonjour ${reservation.customer_name} !\n\n` +
      `Nous vous rappelons votre réservation pour demain :\n` +
      `• Date : ${new Date(reservation.reservation_date).toLocaleDateString("fr-FR")}\n` +
      `• Heure : ${reservation.reservation_time}\n` +
      `• Personnes : ${reservation.party_size}\n\n` +
      `À demain !\n\n` +
      `Resto BF`;

    openWhatsApp(reservation.customer_phone, msg);
    toast.success("Message de rappel ouvert");
  };

  const sendPaymentReminder = (order: any) => {
    const msg = `Bonjour ${order.customer_name || "Client"} !\n\n` +
      `Nous vous rappelons que votre commande d'un montant de ${order.total.toLocaleString("fr-FR")} F n'a pas encore été payée.\n\n` +
      `Merci de régler votre commande.\n\n` +
      `Resto BF`;

    openWhatsApp(order.customer_phone || "", msg);
    toast.success("Rappel de paiement ouvert");
  };

  const sendCustomMessage = () => {
    if (!selectedPhone || !message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    openWhatsApp(selectedPhone, message);
    toast.success("Message ouvert");
    setMessage("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/15 text-emerald-300";
      case "pending":
        return "bg-amber-500/15 text-amber-300";
      case "cancelled":
        return "bg-red-500/15 text-red-300";
      default:
        return "bg-white/5 text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  if (!r?.whatsapp) {
    return (
      <div className="max-w-2xl p-8 rounded-3xl border border-amber-500/30 bg-amber-500/5 text-center">
        <Phone className="w-12 h-12 mx-auto mb-3 text-amber-400" />
        <h2 className="text-2xl font-black mb-2">WhatsApp non configuré</h2>
        <p className="text-sm text-muted-foreground">
          Configurez votre numéro WhatsApp dans Paramètres pour utiliser la messagerie.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Communication</p>
        <h1 className="text-3xl font-black">Messagerie WhatsApp</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("reservations")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "reservations"
              ? "bg-gold text-[#0a0a0f]"
              : "bg-white/5 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Réservations ({reservations.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "orders"
              ? "bg-gold text-[#0a0a0f]"
              : "bg-white/5 text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Commandes impayées ({orders.filter((o) => o.status !== "paid" && o.status !== "cancelled").length})
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : activeTab === "reservations" ? (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-white/15 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune réservation</p>
            </div>
          ) : (
            reservations.map((res) => (
              <div key={res.id} className="p-5 rounded-2xl border border-white/8 bg-dark-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gold" />
                      <strong className="text-sm">{res.customer_name}</strong>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getStatusColor(res.status)}`}>
                        {getStatusLabel(res.status)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{res.customer_phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(res.reservation_date).toLocaleDateString("fr-FR")} à {res.reservation_time} · {res.party_size} personnes
                    </p>
                    {res.notes && (
                      <p className="text-xs text-muted-foreground mt-1">📝 {res.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => sendConfirmation(res)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20"
                  >
                    ✓ Confirmer
                  </button>
                  <button
                    onClick={() => sendReminder(res)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20"
                  >
                    🔔 Rappel
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPhone(res.customer_phone);
                      setSelectedName(res.customer_name);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-xs font-semibold hover:bg-gold/20"
                  >
                    💬 Message personnalisé
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.filter((o) => o.status !== "paid" && o.status !== "cancelled").length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-white/15 text-center text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune commande impayée</p>
            </div>
          ) : (
            orders
              .filter((o) => o.status !== "paid" && o.status !== "cancelled")
              .map((order) => (
                <div key={order.id} className="p-5 rounded-2xl border border-white/8 bg-dark-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <strong className="text-sm">Commande</strong>
                      <p className="text-xs text-muted-foreground">
                        {order.customer_name} · {order.customer_phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <strong className="text-lg text-gold">{order.total.toLocaleString("fr-FR")} F</strong>
                  </div>

                  <button
                    onClick={() => sendPaymentReminder(order)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold hover:bg-amber-500/20"
                  >
                    💬 Rappel paiement
                  </button>
                </div>
              ))
          )}
        </div>
      )}

      {selectedPhone && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setSelectedPhone("");
            setSelectedName("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0f] p-6"
          >
            <h3 className="text-xl font-black mb-2">Message à {selectedName}</h3>
            <p className="text-xs text-muted-foreground mb-4">{selectedPhone}</p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm mb-4"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setSelectedPhone("");
                  setSelectedName("");
                  setMessage("");
                }}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={sendCustomMessage}
                className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm flex items-center gap-2"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}