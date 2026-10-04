import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, CreditCard, RefreshCw } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  preparing: "En préparation",
  ready: "Prête",
  delivered: "Servie",
  paid: "Payée",
  cancelled: "Annulée",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente de paiement",
  processing: "Paiement en cours",
  completed: "Payée",
  failed: "Échec du paiement",
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
      .from("payment_codes")
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
      .from("payment_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", validCode.id);

    // Mettre à jour la commande
    const { error: updateError } = await supabase
      .from("orders")
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

    toast.success("Paiement confirmé ! Merci pour votre repas");
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
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold mb-2">Aucune commande</h3>
        <p className="text-muted-foreground text-sm">
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
        <h3 className="text-2xl font-black flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-gold" /> Mes commandes
        </h3>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input text-sm font-semibold text-muted-foreground hover:border-gold/40 hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </button>
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="p-5 rounded-2xl border border-border bg-card shadow-card hover:border-gold/30 transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {new Date(order.created_at).toLocaleString("fr-FR")}
              </p>
              <p className="text-xs text-muted-foreground/70">
                Table {order.table_number || "Sur place"}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold/20 text-gold">
                {STATUS_LABELS[order.status] || order.status}
              </span>
              {order.payment_status && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                </p>
              )}
            </div>
          </div>

          {/* Liste des articles */}
          <div className="space-y-2 mb-3">
            {order.items?.map((item: OrderItem, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-foreground/80">
                  {item.qty}x {item.name}
                </span>
                <span className="text-amber-deep font-bold">
                  {(item.price * item.qty).toLocaleString("fr-FR")} F
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60 mb-3">
            <span className="font-bold">Total</span>
            <span className="text-xl font-black text-amber-deep">
              {Number(order.total).toLocaleString("fr-FR")} F
            </span>
          </div>

          {/* Actions */}
          {order.status === "delivered" && order.payment_status !== "completed" && (
            <button
              onClick={() => initiatePayment(order.id)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald text-white font-bold hover:bg-emerald-deep transition-colors"
            >
              <CreditCard className="h-4 w-4" /> Payer maintenant
            </button>
          )}

          {order.payment_status === "completed" && (
            <div className="p-3 rounded-xl bg-emerald-tint border border-emerald/30 text-center">
              <p className="text-sm text-emerald-deep font-bold inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {order.paid_at
                  ? `Payé le ${new Date(order.paid_at).toLocaleString("fr-FR")}`
                  : "Paiement confirmé"}
              </p>
              {order.payment_method && (
                <p className="text-xs text-muted-foreground mt-1">Via {order.payment_method}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Modal de paiement */}
      {showPaymentModal && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-level3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-gold" /> Paiement
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Entrez le code fourni par le restaurant
            </p>

            <div className="p-4 rounded-xl bg-surface-warm border border-border/60 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Montant à payer</p>
              <p className="text-3xl font-black text-amber-deep">
                {Number(selectedOrder.total).toLocaleString("fr-FR")} F
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Moyens de paiement acceptés
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-surface-warm border border-border/60 text-center">
                  <p className="text-sm font-bold text-foreground">Orange Money</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-warm border border-border/60 text-center">
                  <p className="text-sm font-bold text-foreground">Moov Money</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-warm border border-border/60 text-center">
                  <p className="text-sm font-bold text-foreground">Espèces</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-warm border border-border/60 text-center">
                  <p className="text-sm font-bold text-foreground">Wave</p>
                </div>
              </div>
            </div>

            <input
              type="text"
              value={paymentCode}
              onChange={(e) => setPaymentCode(e.target.value)}
              placeholder="Entrez le code de paiement"
              className="w-full px-4 py-3 rounded-xl bg-surface-warm border border-input text-sm mb-4"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 rounded-xl border border-input font-bold hover:bg-surface-warm transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmPayment}
                disabled={loading || !paymentCode.trim()}
                className="flex-1 py-3 rounded-xl bg-emerald text-white font-bold disabled:opacity-60 hover:bg-emerald-deep transition-colors"
              >
                {loading ? "Vérification..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
