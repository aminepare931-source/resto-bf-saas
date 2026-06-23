import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/_authenticated/dashboard/facturation")({
  component: BillingPage,
});

type Line = { description: string; quantity: number; unit_price: number };
type Invoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  items: Line[];
  subtotal: number;
  tax_rate: number;
  total: number;
  status: string;
  issued_at: string;
  due_at: string | null;
  notes: string | null;
};

function BillingPage() {
  const { restaurant: r, loading: loadingResto } = useMyRestaurant();
  const isPremium = r?.plan === "premium" || r?.plan === "sur_mesure";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!r) return;
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("restaurant_id", r.id)
      .order("issued_at", { ascending: false });
    setInvoices((data ?? []) as unknown as Invoice[]);
    setLoading(false);
  };
  useEffect(() => { if (r) load(); }, [r?.id]);

  if (loadingResto) return <p className="text-muted-foreground">Chargement...</p>;
  if (!isPremium) {
    return (
      <div className="max-w-2xl p-8 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Premium uniquement</p>
        <h2 className="mt-2 text-3xl font-black">Facturation professionnelle</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Créez et imprimez vos factures (PDF) avec votre logo, votre numérotation,
          le suivi payé / impayé. Réservé à l'abonnement Premium.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Facturation</p>
          <h1 className="text-3xl font-black">Factures</h1>
        </div>
        <button onClick={() => setCreating(true)} className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold">
          + Nouvelle facture
        </button>
      </div>

      {loading ? <p className="text-muted-foreground">Chargement...</p> : (
        invoices.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-white/15 text-center text-muted-foreground">
            Aucune facture. Créez la première !
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 bg-dark-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-4">N°</th>
                  <th className="text-left p-4">Client</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-right p-4">Total</th>
                  <th className="text-left p-4">Statut</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-white/5">
                    <td className="p-4 font-mono text-gold">{inv.invoice_number}</td>
                    <td className="p-4">{inv.customer_name}</td>
                    <td className="p-4 text-muted-foreground">{new Date(inv.issued_at).toLocaleDateString("fr-FR")}</td>
                    <td className="p-4 text-right font-bold">{inv.total.toLocaleString("fr-FR")} F</td>
                    <td className="p-4">
                      <StatusBadge status={inv.status} onChange={async (s) => {
                        await supabase.from("invoices").update({ status: s }).eq("id", inv.id);
                        load();
                      }} />
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => downloadPdf(inv, r!)} className="px-3 py-1.5 rounded-lg border border-gold/40 text-gold text-xs font-bold hover:bg-gold/10">PDF</button>
                      <button onClick={async () => {
                        if (!confirm("Supprimer cette facture ?")) return;
                        await supabase.from("invoices").delete().eq("id", inv.id);
                        load();
                      }} className="ml-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs hover:border-destructive hover:text-destructive">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {creating && r && (
        <InvoiceModal restaurantId={r.id} prefix={(r as any).invoice_prefix ?? "FACT"} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />
      )}
    </div>
  );
}

function StatusBadge({ status, onChange }: { status: string; onChange: (s: string) => void }) {
  const colors: Record<string, string> = {
    paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    unpaid: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return (
    <select value={status} onChange={(e) => onChange(e.target.value)} className={`px-2 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${colors[status] ?? "bg-white/5 border-white/10"}`}>
      <option value="unpaid">Impayé</option>
      <option value="paid">Payé</option>
      <option value="cancelled">Annulé</option>
    </select>
  );
}

function InvoiceModal({ restaurantId, prefix, onClose, onSaved }: { restaurantId: string; prefix: string; onClose: () => void; onSaved: () => void }) {
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [lines, setLines] = useState<Line[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const total = subtotal * (1 + taxRate / 100);

  const submit = async () => {
    if (!customer.name) return toast.error("Nom du client requis");
    if (lines.some((l) => !l.description)) return toast.error("Toutes les lignes doivent être décrites");
    setSaving(true);
    const number = `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const { error } = await supabase.from("invoices").insert({
      restaurant_id: restaurantId,
      invoice_number: number,
      customer_name: customer.name,
      customer_email: customer.email || null,
      customer_phone: customer.phone || null,
      items: lines as any,
      subtotal,
      tax_rate: taxRate,
      total,
      status: "unpaid",
      due_at: dueDate || null,
      notes: notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Facture créée");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0f]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-black">Nouvelle facture</h3>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Nom du client *" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm" />
            <input placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm" />
            <input placeholder="Téléphone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm" />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <strong className="text-sm">Lignes</strong>
              <button type="button" onClick={() => setLines([...lines, { description: "", quantity: 1, unit_price: 0 }])} className="text-xs px-2 py-1 rounded-lg border border-gold/30 text-gold">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_120px_auto] gap-2">
                  <input placeholder="Description" value={l.description} onChange={(e) => { const x = [...lines]; x[i] = { ...l, description: e.target.value }; setLines(x); }} className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm" />
                  <input type="number" min={1} value={l.quantity} onChange={(e) => { const x = [...lines]; x[i] = { ...l, quantity: +e.target.value }; setLines(x); }} className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm" />
                  <input type="number" min={0} placeholder="PU" value={l.unit_price} onChange={(e) => { const x = [...lines]; x[i] = { ...l, unit_price: +e.target.value }; setLines(x); }} className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm" />
                  <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} className="px-2 text-muted-foreground hover:text-destructive">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">TVA %</span>
              <input type="number" value={taxRate} onChange={(e) => setTaxRate(+e.target.value)} className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm" />
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
              <strong className="text-2xl text-gold">{total.toLocaleString("fr-FR")} F</strong>
            </div>
          </div>

          <textarea placeholder="Notes (optionnel)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm" />

          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm">Annuler</button>
            <button onClick={submit} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm">
              {saving ? "..." : "Créer la facture"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function downloadPdf(inv: Invoice, r: any) {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text(r.name ?? "Restaurant", 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (r.address) doc.text(r.address, 14, 30);
  if (r.phone) doc.text(`Tél: ${r.phone}`, 14, 36);
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`FACTURE ${inv.invoice_number}`, 200, 22, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date: ${new Date(inv.issued_at).toLocaleDateString("fr-FR")}`, 200, 30, { align: "right" });
  if (inv.due_at) doc.text(`Échéance: ${new Date(inv.due_at).toLocaleDateString("fr-FR")}`, 200, 36, { align: "right" });

  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text("Facturé à:", 14, 52);
  doc.setFontSize(12);
  doc.text(inv.customer_name, 14, 58);
  if (inv.customer_email) { doc.setFontSize(9); doc.setTextColor(100); doc.text(inv.customer_email, 14, 64); }

  autoTable(doc, {
    startY: 75,
    head: [["Description", "Qté", "PU", "Total"]],
    body: inv.items.map((l) => [l.description, l.quantity, l.unit_price.toLocaleString("fr-FR"), (l.quantity * l.unit_price).toLocaleString("fr-FR")]),
    foot: [
      ["", "", "Sous-total", `${inv.subtotal.toLocaleString("fr-FR")} F`],
      ...(inv.tax_rate ? [["", "", `TVA ${inv.tax_rate}%`, `${(inv.total - inv.subtotal).toLocaleString("fr-FR")} F`]] : []),
      ["", "", "TOTAL", `${inv.total.toLocaleString("fr-FR")} F`],
    ],
    theme: "striped",
    headStyles: { fillColor: [201, 161, 74] },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
  });

  if (inv.notes || r.invoice_footer) {
    const y = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setTextColor(100);
    if (inv.notes) doc.text(`Notes: ${inv.notes}`, 14, y);
    if (r.invoice_footer) doc.text(r.invoice_footer, 14, y + 8);
  }

  doc.save(`facture-${inv.invoice_number}.pdf`);
}