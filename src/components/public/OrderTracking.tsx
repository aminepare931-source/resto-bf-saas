import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  new: "🆕 Nouvelle",
  preparing: "👨‍🍳 En préparation",
  ready: "✅ Prête",
  delivered: "🎉 Servie",
  paid: "💳 Payée",
  cancelled: "❌ Annulée",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "⏳ En attente de paiement",
  processing: "🔄 Paiement en cours",
  completed: "✅ Payée",
  failed: "❌ Échec du paiement",
};

interface OrderItem {
  qty: number;
  name: string;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  table_number: string | null;
  status: string;
  payment_status?: string;
  payment_method?: string;
  paid_at?: string;
  items: OrderItem[];
  total: number;
}

export function OrderTracking({
  restaurantId,
  tableNumber,
}: {
  restaurantId: string;
  tableNumber: string | null;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentCode, setPaymentCode] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Charger les commandes du client
  const loadOrders = async () => {
    if (!restaurantId) return;

    let query = supabase
      .from("orders" as never)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    // Si on a un numéro de table, filtrer par table
    if (tableNumber) {
      query = query.eq("table_number", tableNumber);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur chargement commandes:", error);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();

    // Écouter les nouvelles commandes et mises à jour
    const channel = supabase
      .channel(`tracking-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          loadOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, tableNumber]);

  const initiatePayment = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowPaymentModal(true);
    }
  };

  const confirmPayment = async () => {
    if (!selectedOrder || !paymentCode.trim()) {
      toast.error("Veuillez entrer le code de paiement");
      return;
    }

    setLoading(true);

    // Vérifier le code de paiement auprès de l'admin
    const { data: validCode, error: codeError } = await supabase
      .from("payment_codes" as never)
      .select("*")
      .eq("code", paymentCode.trim())
      .eq("order_id", selectedOrder.id)
      .eq("used", false)
      .maybeSingle();

    if (codeError || !validCode) {
      toast.error("Code de paiement invalide ou déjà utilisé");
      setLoading(false);
      return;
    }

    // Marquer le code comme utilisé
    await supabase
      .from("payment_codes" as never)
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", validCode.id);

    // Mettre à jour la commande
    const { error: updateError } = await supabase
      .from("orders" as never)
      .update({
        status: "paid",
        payment_status: "completed",
        payment_method: validCode.method,
        paid_at: new Date().toISOString(),
      })
      .eq("id", selectedOrder.id);

    if (updateError) {
      toast.error("Erreur lors du paiement");
      setLoading(false);
      return;
    }

    toast.success("✅ Paiement confirmé ! Merci pour votre repas");
    setShowPaymentModal(false);
    setPaymentCode("");
    setSelectedOrder(null);
    loadOrders();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold mb-2">Aucune commande</h3>
        <p className="text-white/60 text-sm">
          {tableNumber
            ? `Vous n'avez pas encore commandé pour la table ${tableNumber}`
            : "Vous n'avez pas encore passé de commande"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black">📋 Mes commandes</h3>
        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold hover:border-gold/40 transition-colors"
        >
          🔄 Actualiser
        </button>
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-gold/30 transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-white/60 mb-1">
                {new Date(order.created_at).toLocaleString("fr-FR")}
              </p>
              <p className="text-xs text-white/40">Table {order.table_number || "Sur place"}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold/20 text-gold">
                {STATUS_LABELS[order.status] || order.status}
              </span>
              {order.payment_status && (
                <p className="text-[10px] text-white/60 mt-1">
                  {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                </p>
              )}
            </div>
          </div>

          {/* Liste des articles */}
          <div className="space-y-2 mb-3">
            {order.items?.map((item: OrderItem, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-white/80">
                  {item.qty}x {item.name}
                </span>
                <span className="text-amber-400 font-bold">
                  {(item.price * item.qty).toLocaleString("fr-FR")} F
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mb-3">
            <span className="font-bold">Total</span>
            <span className="text-xl font-black text-amber-400">
              {Number(order.total).toLocaleString("fr-FR")} F
            </span>
          </div>

          {/* Actions */}
          {order.status === "delivered" && order.payment_status !== "completed" && (
            <button
              onClick={() => initiatePayment(order.id)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:scale-[1.02] transition-transform"
            >
              💳 Payer maintenant
            </button>
          )}

          {order.payment_status === "completed" && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <p className="text-sm text-green-400 font-bold">
                ✅ Payé le {new Date(order.paid_at).toLocaleString("fr-FR")}
              </p>
              {order.payment_method && (
                <p className="text-xs text-white/60 mt-1">Via {order.payment_method}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Modal de paiement */}
      {showPaymentModal && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black mb-2">💳 Paiement</h3>
            <p className="text-white/60 text-sm mb-6">Entrez le code fourni par le restaurant</p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <p className="text-xs text-white/60 mb-1">Montant à payer</p>
              <p className="text-3xl font-black text-amber-400">
                {Number(selectedOrder.total).toLocaleString("fr-FR")} F
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Moyens de paiement acceptés
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                  <p className="text-sm font-bold text-orange-400">Orange Money</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                  <p className="text-sm font-bold text-blue-400">Moov Money</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                  <p className="text-sm font-bold text-yellow-400">Espèces</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                  <p className="text-sm font-bold text-green-400">Wave</p>
                </div>
              </div>
            </div>

            <input
              type="text"
              value={paymentCode}
              onChange={(e) => setPaymentCode(e.target.value)}
              placeholder="Entrez le code de paiement"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm mb-4"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmPayment}
                disabled={loading || !paymentCode.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold disabled:opacity-60 hover:scale-[1.02] transition-transform"
              >
                {loading ? "Vérification..." : "✅ Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
