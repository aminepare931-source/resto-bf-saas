import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PaymentCodeModal({ order, onClose }: { order: any; onClose: () => void }) {
  const [method, setMethod] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCode(randomCode);
  };

  const saveCode = async () => {
    if (!method || !code) { toast.error("Veuillez choisir un moyen de paiement"); return; }
    setLoading(true);
    const { error } = await supabase.from("payment_codes" as never).insert({ order_id: order.id, code: code.toUpperCase(), method, amount: order.total } as never);
    setLoading(false);
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Code de paiement généré !");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-2">💳 Code de paiement</h3>
        <p className="text-white/60 text-sm mb-6">Commande #{order.id.slice(0, 8)}</p>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
          <p className="text-xs text-white/60 mb-1">Montant</p>
          <p className="text-3xl font-black text-amber-400">{Number(order.total).toLocaleString("fr-FR")} F</p>
        </div>
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">Moyen de paiement</label>
          <div className="grid grid-cols-2 gap-2">
            {["orange_money","moov_money","cash","wave"].map((m) => (
              <button key={m} onClick={() => setMethod(m)}
                className={`p-3 rounded-lg border text-sm font-bold transition-all ${method === m ? "border-gold bg-gold/20 text-gold" : "border-white/10 text-white/60 hover:border-white/20"}`}>
                {m === "orange_money" ? "Orange Money" : m === "moov_money" ? "Moov Money" : m === "cash" ? "Espèces" : "Wave"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider block">Code</label>
          <div className="flex gap-2">
            <input type="text" value={code} readOnly className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-mono" />
            <button onClick={generateCode} className="px-4 py-3 rounded-xl bg-gold/20 text-gold font-bold text-sm">Générer</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 font-bold">Annuler</button>
          <button onClick={saveCode} disabled={loading || !method || !code}
            className="flex-1 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold disabled:opacity-60">
            {loading ? "Enregistrement..." : "✅ Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}