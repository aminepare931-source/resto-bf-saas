import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PublicMenuItem, PublicRestaurant } from "./shared";
import { orderSchema, firstZodError, type OrderItem } from "@/lib/validation";
import { fmtPrice } from "./shared";

export function OrderCartFab({
  restaurant,
  menu,
  tableNumber,
}: {
  restaurant: PublicRestaurant;
  menu: PublicMenuItem[];
  tableNumber: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState({ name: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const available = useMemo(() => menu.filter((m) => m.available), [menu]);
  const lines: OrderItem[] = useMemo(
    () =>
      available
        .filter((m) => (items[m.id] ?? 0) > 0)
        .map((m) => ({ menu_item_id: m.id, name: m.name, price: Number(m.price), qty: items[m.id] })),
    [available, items],
  );
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  const setQty = (id: string, q: number) =>
    setItems((prev) => {
      const next = { ...prev };
      if (q <= 0) delete next[id];
      else next[id] = Math.min(q, 50);
      return next;
    });

  const submit = async () => {
    const payload = {
      restaurant_id: restaurant.id,
      table_number: tableNumber,
      customer_name: customer.name.trim() || null,
      customer_phone: customer.phone.trim() || null,
      notes: customer.notes.trim() || null,
      items: lines,
    };
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(firstZodError(parsed.error));
      return;
    }
    setBusy(true);
    const { error } = await supabase
      // orders table not yet in generated types; cast safely.
      .from("orders" as never)
      .insert({
        restaurant_id: restaurant.id,
        table_number: tableNumber,
        customer_name: customer.name.trim() || null,
        customer_phone: customer.phone.trim() || null,
        notes: customer.notes.trim() || null,
        items: lines,
        subtotal: total,
        total,
        status: "new",
        source: "qr",
      } as never);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Commande envoyée à la cuisine ✓");
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      setItems({});
      setCustomer({ name: "", phone: "", notes: "" });
    }, 2200);
  };

  const count = Object.values(items).reduce((s, q) => s + q, 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-50 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm shadow-2xl hover:scale-105 transition"
      >
        🛒 Commander{count > 0 ? ` · ${count}` : ""}
        {tableNumber ? <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-[10px]">Table {tableNumber}</span> : null}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => !busy && setOpen(false)}>
          <div
            className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0a0a0f] text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Commande</p>
                <strong className="text-lg">{restaurant.name}</strong>
                {tableNumber && <p className="text-xs text-white/60">Table {tableNumber}</p>}
              </div>
              <button onClick={() => !busy && setOpen(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
            </div>

            {done ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-3">
                <div className="text-5xl">✅</div>
                <strong className="text-xl">Commande envoyée !</strong>
                <p className="text-sm text-white/60">La cuisine prépare votre commande.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-2">
                  {available.length === 0 && <p className="text-white/60 text-sm">Le menu est vide.</p>}
                  {available.map((m) => {
                    const q = items[m.id] ?? 0;
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="flex-1 min-w-0">
                          <strong className="block text-sm truncate">{m.name}</strong>
                          <span className="text-xs text-amber-400 font-bold">{fmtPrice(Number(m.price))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setQty(m.id, q - 1)} className="w-8 h-8 rounded-lg bg-white/10 font-bold disabled:opacity-30" disabled={q === 0}>−</button>
                          <span className="w-6 text-center font-bold">{q}</span>
                          <button onClick={() => setQty(m.id, q + 1)} className="w-8 h-8 rounded-lg bg-amber-500 text-black font-bold">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {lines.length > 0 && (
                  <div className="p-5 border-t border-white/5 space-y-3 bg-black/50">
                    <input
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value.slice(0, 80) })}
                      placeholder="Votre nom (optionnel)"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm"
                    />
                    <input
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value.slice(0, 20) })}
                      placeholder="Téléphone (optionnel)"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm"
                    />
                    <textarea
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value.slice(0, 500) })}
                      placeholder="Notes (allergies, cuisson…)"
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Total</span>
                      <strong className="text-xl text-amber-400">{fmtPrice(total)}</strong>
                    </div>
                    <button
                      onClick={submit}
                      disabled={busy}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black disabled:opacity-60"
                    >
                      {busy ? "Envoi..." : "✅ Envoyer la commande"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}