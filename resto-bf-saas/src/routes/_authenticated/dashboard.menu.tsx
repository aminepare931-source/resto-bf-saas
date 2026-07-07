import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { uploadRestaurantFile, deleteRestaurantFile } from "@/lib/storage";
import { StorageImage } from "@/components/StorageImage";

export const Route = createFileRoute("/_authenticated/dashboard/menu")({
  component: MenuPage,
});

type Item = {
  id: string;
  restaurant_id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  position: number;
};

const MAX_BY_PLAN: Record<string, number> = { gratuit: 5, standard: 30, premium: 9999 };

function MenuPage() {
  const { restaurant } = useMyRestaurant();
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const max = restaurant ? MAX_BY_PLAN[restaurant.plan] ?? 30 : 30;

  const load = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("category")
      .order("position");
    setItems((data ?? []) as Item[]);
  };

  useEffect(() => {
    load();
  }, [restaurant?.id]);

  const startNew = () => {
    if (items.length >= max) {
      toast.error(`Limite atteinte (${max} plats sur votre forfait ${restaurant?.plan}).`);
      return;
    }
    setEditing({ category: "Plats", name: "", description: "", price: 0, available: true });
    setFile(null);
  };

  const save = async () => {
    if (!restaurant || !editing) return;
    if (!editing.name?.trim()) return toast.error("Le nom du plat est requis");
    setBusy(true);
    try {
      let image_url = editing.image_url ?? null;
      if (file) {
        if (image_url) await deleteRestaurantFile(image_url);
        image_url = await uploadRestaurantFile(restaurant.id, file);
      }
      const payload = {
        restaurant_id: restaurant.id,
        category: editing.category || "Plats",
        name: editing.name,
        description: editing.description ?? null,
        price: Number(editing.price) || 0,
        image_url,
        available: editing.available ?? true,
      };
      if (editing.id) {
        const { error } = await supabase.from("menu_items").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert(payload);
        if (error) throw error;
      }
      toast.success("Plat enregistré ✓");
      setEditing(null);
      setFile(null);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (it: Item) => {
    if (!confirm(`Supprimer "${it.name}" ?`)) return;
    if (it.image_url) await deleteRestaurantFile(it.image_url);
    await supabase.from("menu_items").delete().eq("id", it.id);
    toast.success("Supprimé");
    load();
  };

  const toggle = async (it: Item) => {
    await supabase.from("menu_items").update({ available: !it.available }).eq("id", it.id);
    load();
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Menu</p>
          <h1 className="text-3xl font-black">Vos plats ({items.length}/{max === 9999 ? "∞" : max})</h1>
        </div>
        <button onClick={startNew} className="px-5 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold transition-shadow">
          + Ajouter un plat
        </button>
      </div>

      {items.length === 0 && !editing && (
        <div className="p-10 rounded-2xl border border-dashed border-white/10 text-center text-muted-foreground">
          Aucun plat pour le moment. Cliquez sur « Ajouter un plat ».
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border border-white/8 bg-dark-card overflow-hidden">
            <StorageImage path={it.image_url} alt={it.name} className="w-full aspect-[4/3] object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold">{it.category}</p>
                  <h3 className="font-bold mt-1">{it.name}</h3>
                </div>
                <span className="font-black text-gold whitespace-nowrap">{it.price} F</span>
              </div>
              {it.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{it.description}</p>}
              <div className="mt-3 flex gap-2 text-xs">
                <button onClick={() => { setEditing(it); setFile(null); }} className="flex-1 px-3 py-2 rounded-lg border border-white/10 hover:border-gold/40 font-semibold">Modifier</button>
                <button onClick={() => toggle(it)} className={`px-3 py-2 rounded-lg border font-semibold ${it.available ? "border-green-500/30 text-green-400" : "border-white/10 text-muted-foreground"}`}>
                  {it.available ? "Visible" : "Masqué"}
                </button>
                <button onClick={() => remove(it)} className="px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10">✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111118] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black mb-4">{editing.id ? "Modifier le plat" : "Nouveau plat"}</h2>
            <div className="space-y-3">
              <Input label="Catégorie" value={editing.category ?? ""} onChange={(v) => setEditing({ ...editing, category: v })} placeholder="Plats, Boissons, Desserts..." />
              <Input label="Nom du plat" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} placeholder="Poulet braisé" />
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8 focus:border-gold focus:outline-none text-sm"
                  placeholder="Poulet entier mariné, frites, sauce maison"
                />
              </div>
              <Input label="Prix (FCFA)" type="number" value={String(editing.price ?? 0)} onChange={(v) => setEditing({ ...editing, price: Number(v) })} />
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-1.5 w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold/20 file:text-gold file:font-semibold"
                />
                {(file || editing.image_url) && (
                  <p className="text-[11px] text-muted-foreground mt-1">{file ? `Nouvelle: ${file.name}` : "Une photo est déjà associée"}</p>
                )}
              </div>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold">Annuler</button>
              <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] text-sm font-bold disabled:opacity-60">
                {busy ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8 focus:border-gold focus:outline-none text-sm"
      />
    </div>
  );
}
