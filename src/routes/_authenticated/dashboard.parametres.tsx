import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bike } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/parametres")({
  component: SettingsPage,
});

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    cuisine: "",
    owner_name: "",
    phone: "",
    whatsapp: "",
    address: "",
    hours: "",
    description: "",
    offers_delivery: false,
    notification_orders_channel: "both",
    notification_reservations_channel: "both",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("restaurants")
        .select(
          "name, city, cuisine, owner_name, phone, whatsapp, address, hours, description, offers_delivery, notification_orders_channel, notification_reservations_channel",
        )
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (data)
        setForm((f) => ({
          ...f,
          ...data,
          cuisine: data.cuisine ?? "",
          whatsapp: data.whatsapp ?? "",
          address: data.address ?? "",
          hours: data.hours ?? "",
          description: data.description ?? "",
          offers_delivery: data.offers_delivery ?? false,
          notification_orders_channel: data.notification_orders_channel ?? "both",
          notification_reservations_channel: data.notification_reservations_channel ?? "both",
        }));
      setLoading(false);
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("restaurants").update(form).eq("user_id", u.user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Informations enregistrées ✓");
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (loading) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-terracotta font-bold mb-2">
          Paramètres
        </p>
        <h1 className="text-3xl font-black">Informations du restaurant</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ces informations apparaîtront sur votre site public.
        </p>
      </div>

      <form onSubmit={save} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom du restaurant" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Ville" value={form.city} onChange={(v) => set("city", v)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Type de cuisine" value={form.cuisine} onChange={(v) => set("cuisine", v)} />
          <Field
            label="Nom du gérant"
            value={form.owner_name}
            onChange={(v) => set("owner_name", v)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Téléphone" value={form.phone} onChange={(v) => set("phone", v)} />
          <Field
            label="WhatsApp (sans +)"
            value={form.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            placeholder="22670000000"
          />
        </div>
        <Field
          label="Adresse"
          value={form.address}
          onChange={(v) => set("address", v)}
          placeholder="Avenue Kwamé Nkrumah, Ouagadougou"
        />
        <Field
          label="Horaires"
          value={form.hours}
          onChange={(v) => set("hours", v)}
          placeholder="Lun-Dim · 11h - 23h30"
        />

        <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-warm cursor-pointer">
          <span>
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <Bike className="w-4 h-4 text-terracotta" /> Je propose la livraison
            </span>
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              Si désactivé, vos clients ne verront jamais l'option "Livraison" — seulement "Sur
              place".
            </span>
          </span>
          <input
            type="checkbox"
            checked={form.offers_delivery}
            onChange={(e) => setForm((f) => ({ ...f, offers_delivery: e.target.checked }))}
            className="w-5 h-5 accent-terracotta shrink-0"
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className="px-4 py-3 rounded-xl bg-card border border-border focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-sm"
            placeholder="Présentez votre restaurant en quelques phrases..."
          />
        </div>

        <div className="p-6 rounded-2xl border border-terracotta/20 bg-terracotta-tint/40">
          <h3 className="text-sm font-black uppercase tracking-widest text-terracotta mb-4">
            Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Réception des commandes
              </label>
              <select
                value={form.notification_orders_channel || "both"}
                onChange={(e) => set("notification_orders_channel", e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-card border border-border focus:border-terracotta/50 focus:outline-none text-sm"
              >
                <option value="admin">Panneau admin uniquement</option>
                <option value="whatsapp">WhatsApp uniquement</option>
                <option value="both">Les deux (admin + WhatsApp)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Où souhaitez-vous recevoir les notifications de nouvelles commandes ?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Réception des réservations
              </label>
              <select
                value={form.notification_reservations_channel || "both"}
                onChange={(e) => set("notification_reservations_channel", e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-card border border-border focus:border-terracotta/50 focus:outline-none text-sm"
              >
                <option value="admin">Panneau admin uniquement</option>
                <option value="whatsapp">WhatsApp uniquement</option>
                <option value="both">Les deux (admin + WhatsApp)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Où souhaitez-vous recevoir les notifications de nouvelles réservations ?
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-7 py-3 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-deep transition-colors disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 rounded-xl bg-card border border-border focus:border-terracotta/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-sm"
      />
    </div>
  );
}
