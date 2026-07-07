import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";
import { Plus, AlertTriangle, Package, TrendingDown, RefreshCw, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StockCardSkeleton, KpiCardSkeleton } from "@/components/ui/skeleton";
import type { StockItem } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/stocks")({
  component: StocksPage,
});

type StockItemForm = {
  name: string;
  category: string;
  current_quantity: number;
  min_quantity: number;
  unit: string;
};

const UNITS = ["kg", "g", "L", "mL", "pièce", "boîte", "sachet", "bouteille"];

const CATEGORIES = [
  "Viandes",
  "Poissons",
  "Légumes",
  "Fruits",
  "Épicerie",
  "Boissons",
  "Produits laitiers",
  "Condiments",
  "Autres",
];

function StocksPage() {
  const { restaurant: r } = useMyRestaurant();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "critical" | "ok">("all");
  const [deleteTarget, setDeleteTarget] = useState<StockItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newItem, setNewItem] = useState<StockItemForm>({
    name: "",
    category: "Épicerie",
    current_quantity: 0,
    min_quantity: 5,
    unit: "kg",
  });

  useEffect(() => {
    if (r) loadStocks();
  }, [r?.id]);

  const loadStocks = async () => {
    if (!r) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock_items" as never)
        .select("*")
        .eq("restaurant_id", r.id)
        .order("name");

      if (error) throw error;
      setItems((data || []) as unknown as StockItem[]);
    } catch (error) {
      console.error("Error loading stocks:", error);
      toast.error("Erreur lors du chargement des stocks");
    } finally {
      setLoading(false);
    }
  };

  const addStockItem = async () => {
    if (!r || !newItem.name) {
      toast.error("Nom requis");
      return;
    }

    try {
      const status = newItem.current_quantity <= newItem.min_quantity ? "low" : "ok";

      const { error } = await supabase.from("stock_items" as never).insert({
        restaurant_id: r.id,
        name: newItem.name,
        category: newItem.category,
        current_quantity: newItem.current_quantity,
        min_quantity: newItem.min_quantity,
        unit: newItem.unit,
        status,
        last_restock: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("✅ Article ajouté");
      setShowAddModal(false);
      setNewItem({
        name: "",
        category: "Épicerie",
        current_quantity: 0,
        min_quantity: 5,
        unit: "kg",
      });
      loadStocks();
    } catch (error: any) {
      console.error("Error adding stock:", error);
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  const updateQuantity = async (item: StockItem, delta: number) => {
    const newQty = Math.max(0, item.current_quantity + delta);
    const status = newQty <= item.min_quantity ? (newQty === 0 ? "critical" : "low") : "ok";

    try {
      const { error } = await supabase
        .from("stock_items" as never)
        .update({
          current_quantity: newQty,
          status,
          last_restock: delta > 0 ? new Date().toISOString() : item.last_restock,
        })
        .eq("id", item.id);

      if (error) throw error;

      if (newQty === 0) {
        toast.warning(`⚠️ Stock épuisé : ${item.name}`);
      } else if (status === "low") {
        toast.warning(`⚠️ Stock bas : ${item.name} (${newQty} ${item.unit})`);
      }

      loadStocks();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteStockItem = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from("stock_items" as never)
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      toast.success("Article supprimé");
      setDeleteTarget(null);
      loadStocks();
    } catch (error) {
      console.error("Error deleting stock:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result = items;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
    }

    if (filterCategory !== "all") {
      result = result.filter((item) => item.category === filterCategory);
    }

    if (filterStatus !== "all") {
      result = result.filter((item) => item.status === filterStatus);
    }

    return result;
  }, [items, search, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    const total = items.length;
    const low = items.filter((i) => i.status === "low").length;
    const critical = items.filter((i) => i.status === "critical").length;
    const ok = items.filter((i) => i.status === "ok").length;
    return { total, low, critical, ok };
  }, [items]);

  if (!r) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Gestion</p>
        <h1 className="text-3xl font-black">Stocks</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-white/8 bg-dark-card">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-black">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <p className="text-xs text-emerald-400 mb-1">OK</p>
          <p className="text-2xl font-black text-emerald-400">{stats.ok}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <p className="text-xs text-amber-400 mb-1">Bas</p>
          <p className="text-2xl font-black text-amber-400">{stats.low}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
          <p className="text-xs text-red-400 mb-1">Critique</p>
          <p className="text-2xl font-black text-red-400">{stats.critical}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
        >
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
        >
          <option value="all">Tous statuts</option>
          <option value="ok">OK</option>
          <option value="low">Bas</option>
          <option value="critical">Critique</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-gradient-gold text-[#0a0a0f] text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Liste des stocks */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <StockCardSkeleton key={i} />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-white/15 text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun article en stock</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const percentage = item.min_quantity > 0 ? (item.current_quantity / item.min_quantity) * 100 : 100;
            const isLow = item.status === "low" || item.status === "critical";
            const isCritical = item.status === "critical";

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCritical
                    ? "border-red-500/30 bg-red-500/5"
                    : isLow
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-white/8 bg-dark-card"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.category}</span>
                  </div>
                  {isLow && (
                    <AlertTriangle className={`w-5 h-5 ${isCritical ? "text-red-400" : "text-amber-400"}`} />
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-black">{item.current_quantity}</span>
                    <span className="text-xs text-muted-foreground">{item.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Min: {item.min_quantity} {item.unit}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateQuantity(item, -1)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => updateQuantity(item, 1)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'ajout */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un article">
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Nom *</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
              placeholder="Ex: Riz, Poulet, Huile..."
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Catégorie</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Quantité initiale</label>
              <input
                type="number"
                value={newItem.current_quantity}
                onChange={(e) => setNewItem({ ...newItem, current_quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Quantité min</label>
              <input
                type="number"
                value={newItem.min_quantity}
                onChange={(e) => setNewItem({ ...newItem, min_quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Unité</label>
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm">
            Annuler
          </button>
          <button onClick={addStockItem} className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm">
            Ajouter
          </button>
        </div>
      </Modal>

      {/* Dialogue de confirmation suppression */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteStockItem}
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}