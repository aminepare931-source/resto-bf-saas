import { useState } from "react";
import { CheckCircle2, CreditCard, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const METHOD_LABEL: Record<string, string> = {
  orange_money: "Orange Money",
  moov_money: "Moov Money",
  wave: "Wave",
  cash: "Espèces",
};

export function PaymentCodeModal({ order, onClose }: { order: any; onClose: () => void }) {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const isCash = method === "cash";

  const confirmCash = async () => {
    setLoading(true);
    const { error: codeError } = await supabase.from("payment_codes" as never).insert({
      order_id: order.id,
      code: "CASH",
      method: "cash",
      amount: order.total,
      status: "confirmed",
    } as never);
    const { error: orderError } = await supabase
      .from("orders" as never)
      .update({ payment_status: "paid" } as never)
      .eq("id", order.id);
    setLoading(false);
    if (codeError || orderError) {
      toast.error("Erreur: " + (codeError || orderError)?.message);
      return;
    }
    toast.success("Paiement espèces confirmé !");
    onClose();
  };

  const sendMobileMoneyCode = async () => {
    setLoading(true);
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error } = await supabase.from("payment_codes" as never).insert({
      order_id: order.id,
      code: randomCode,
      method,
      amount: order.total,
      status: "pending",
    } as never);
    setLoading(false);
    if (error) {
      toast.error("Erreur: " + error.message);
      return;
    }
    toast.success("Code envoyé — le client le voit sur son écran de suivi.");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-level3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="inline-flex items-center gap-2 text-2xl font-black mb-2">
          <CreditCard className="h-5 w-5 text-gold" /> Encaisser le paiement
        </h3>
        <p className="text-muted-foreground text-sm mb-6">Commande #{order.id.slice(0, 8)}</p>
        <div className="p-4 rounded-xl bg-surface-warm border border-border/60 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Montant</p>
          <p className="text-3xl font-black text-amber-deep">
            {Number(order.total).toLocaleString("fr-FR")} F
          </p>
        </div>
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Moyen de paiement
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["orange_money", "moov_money", "cash", "wave"].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`p-3 rounded-lg border text-sm font-bold transition-all ${method === m ? "border-gold bg-accent text-accent-foreground" : "border-input text-muted-foreground hover:border-gold/40"}`}
              >
                {METHOD_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        {isCash ? (
          <p className="text-xs text-emerald-deep mb-6 p-3 rounded-xl bg-emerald-tint border border-emerald/30">
            Le client vous remet l'argent en main propre — confirmez directement, aucun code
            n'est nécessaire.
          </p>
        ) : method ? (
          <p className="text-xs text-amber-deep mb-6 p-3 rounded-xl bg-amber-tint border border-amber-brand/30">
            Un code sera généré et affiché sur l'écran de suivi du client, avec les instructions
            de paiement. Une fois le client payé, il pourra cliquer "J'ai payé" — vous n'aurez
            plus qu'à valider en vérifiant votre SMS {METHOD_LABEL[method]}.
          </p>
        ) : null}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-input font-bold hover:bg-surface-warm transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={isCash ? confirmCash : sendMobileMoneyCode}
            disabled={loading || !method}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold disabled:opacity-60"
          >
            {loading ? (
              "Enregistrement..."
            ) : isCash ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Confirmer le paiement
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Envoyer le code au client
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
