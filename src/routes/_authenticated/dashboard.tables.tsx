import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";
import { Plus, Users, Clock, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { KpiCardSkeleton } from "@/components/ui/skeleton";
import type { RestaurantTable, TableStatus } from "@/types";
import { TABLE_STATUS_LABEL } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/tables")({
  component: TablesPage,
});

type TableForm = {
  number: string;
  capacity: number;
  zone: string;
};

const ZONES = ["Salle principale", "Terrasse", "VIP", "Privé"];

const STATUS_COLORS: Record<TableStatus, string> = {
  free: "border-emerald/30 bg-emerald-tint",
  occupied: "border-destructive/30 bg-destructive/5",
  reserved: "border-amber-brand/40 bg-amber-tint",
  cleaning: "border-charcoal/20 bg-charcoal/5",
};

const STATUS_ICONS: Record<TableStatus, React.ReactNode> = {
  free: <CheckCircle className="w-4 h-4 text-emerald-deep" />,
  occupied: <Users className="w-4 h-4 text-destructive" />,
  reserved: <Clock className="w-4 h-4 text-amber-deep" />,
  cleaning: <RefreshCw className="w-4 h-4 text-charcoal" />,
};

function TablesPage() {
  const { restaurant: r } = useMyRestaurant();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TableStatus | "all">("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<RestaurantTable | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newTable, setNewTable] = useState<TableForm>({
    number: "",
    capacity: 4,
    zone: "Salle principale",
  });

  useEffect(() => {
    if (r) loadTables();
  }, [r?.id]);

  const loadTables = async () => {
    if (!r) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .eq("restaurant_id", r.id)
        .order("position");

      if (error) throw error;
      setTables((data || []) as unknown as RestaurantTable[]);
    } catch (error) {
      console.error("Error loading tables:", error);
      toast.error("Erreur lors du chargement des tables");
    } finally {
      setLoading(false);
    }
  };

  const addTable = async () => {
    if (!r || !newTable.number) {
      toast.error("Numéro de table requis");
      return;
    }

    try {
      const maxPosition = tables.reduce((max, t) => Math.max(max, t.position), 0);

      const { error } = await supabase.from("restaurant_tables").insert({
        restaurant_id: r.id,
        number: newTable.number,
        capacity: newTable.capacity,
        zone: newTable.zone,
        status: "free",
        position: maxPosition + 1,
      });

      if (error) throw error;

      toast.success("Table ajoutée");
      setShowAddModal(false);
      setNewTable({ number: "", capacity: 4, zone: "Salle principale" });
      loadTables();
    } catch (error: any) {
      console.error("Error adding table:", error);
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  const updateTableStatus = async (table: RestaurantTable, status: TableStatus) => {
    try {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({ status })
        .eq("id", table.id);

      if (error) throw error;

      toast.success(`Table ${table.number} → ${TABLE_STATUS_LABEL[status]}`);
      loadTables();
    } catch (error) {
      console.error("Error updating table status:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteTable = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from("restaurant_tables")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      toast.success("Table supprimée");
      setDeleteTarget(null);
      loadTables();
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const filteredTables = useMemo(() => {
    let result = tables;

    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }

    if (filterZone !== "all") {
      result = result.filter((t) => t.zone === filterZone);
    }

    return result;
  }, [tables, filterStatus, filterZone]);

  const stats = useMemo(() => {
    const total = tables.length;
    const free = tables.filter((t) => t.status === "free").length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const reserved = tables.filter((t) => t.status === "reserved").length;
    const cleaning = tables.filter((t) => t.status === "cleaning").length;
    return { total, free, occupied, reserved, cleaning };
  }, [tables]);

  if (!r) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-terracotta font-bold mb-2">Gestion</p>
        <h1 className="text-3xl font-black">Tables</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-black">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald-tint">
          <p className="text-xs text-emerald-deep mb-1">Libres</p>
          <p className="text-2xl font-black text-emerald-deep">{stats.free}</p>
        </div>
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-xs text-destructive mb-1">Occupées</p>
          <p className="text-2xl font-black text-destructive">{stats.occupied}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-brand/40 bg-amber-tint">
          <p className="text-xs text-amber-deep mb-1">Réservées</p>
          <p className="text-2xl font-black text-amber-deep">{stats.reserved}</p>
        </div>
        <div className="p-4 rounded-xl border border-charcoal/20 bg-charcoal/5">
          <p className="text-xs text-charcoal mb-1">Nettoyage</p>
          <p className="text-2xl font-black text-charcoal">{stats.cleaning}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-card border border-border focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 focus:outline-none transition-all text-sm"
        >
          <option value="all">Tous statuts</option>
          <option value="free">Libre</option>
          <option value="occupied">Occupée</option>
          <option value="reserved">Réservée</option>
          <option value="cleaning">Nettoyage</option>
        </select>
        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 focus:outline-none transition-all text-sm"
        >
          <option value="all">Toutes zones</option>
          {ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-terracotta text-white hover:bg-terracotta-deep transition-colors text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Grille des tables */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
          <p>Aucune table</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className={`p-5 rounded-2xl border transition-all ${STATUS_COLORS[table.status]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-black">Table {table.number}</h3>
                  <p className="text-xs text-muted-foreground">
                    {table.zone || "Salle principale"}
                  </p>
                </div>
                {STATUS_ICONS[table.status]}
              </div>

              <div className="flex items-center gap-2 mb-3 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Capacité: {table.capacity} pers.</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {TABLE_STATUS_LABEL[table.status]}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {table.status === "free" && (
                  <button
                    onClick={() => updateTableStatus(table, "occupied")}
                    className="flex-1 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors"
                  >
                    Occuper
                  </button>
                )}
                {table.status === "free" && (
                  <button
                    onClick={() => updateTableStatus(table, "reserved")}
                    className="flex-1 px-3 py-2 rounded-lg bg-amber-tint text-amber-deep text-xs font-bold hover:bg-amber-brand/20 transition-colors"
                  >
                    Réserver
                  </button>
                )}
                {(table.status === "occupied" || table.status === "reserved") && (
                  <button
                    onClick={() => updateTableStatus(table, "free")}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-tint text-emerald-deep text-xs font-bold hover:bg-emerald/20 transition-colors"
                  >
                    Libérer
                  </button>
                )}
                {(table.status === "occupied" || table.status === "reserved") && (
                  <button
                    onClick={() => updateTableStatus(table, "cleaning")}
                    className="flex-1 px-3 py-2 rounded-lg bg-charcoal/5 text-charcoal text-xs font-bold hover:bg-charcoal/10 transition-colors"
                  >
                    Nettoyage
                  </button>
                )}
                {table.status === "cleaning" && (
                  <button
                    onClick={() => updateTableStatus(table, "free")}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-tint text-emerald-deep text-xs font-bold hover:bg-emerald/20 transition-colors"
                  >
                    Terminé
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(table)}
                  className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs inline-flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter une table">
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Numéro *
            </label>
            <input
              type="text"
              value={newTable.number}
              onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 focus:outline-none transition-all text-sm"
              placeholder="Ex: 1, 2, 3..."
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Capacité (personnes)
            </label>
            <input
              type="number"
              value={newTable.capacity}
              onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 focus:outline-none transition-all text-sm"
              min="1"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Zone
            </label>
            <select
              value={newTable.zone}
              onChange={(e) => setNewTable({ ...newTable, zone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/20 focus:outline-none transition-all text-sm"
            >
              {ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-surface-warm transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            onClick={addTable}
            className="px-5 py-2.5 rounded-xl bg-terracotta text-white hover:bg-terracotta-deep transition-colors font-bold text-sm"
          >
            Ajouter
          </button>
        </div>
      </Modal>

      {/* Dialogue de confirmation suppression */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteTable}
        title="Supprimer la table"
        message={`Êtes-vous sûr de vouloir supprimer la table ${deleteTarget?.number} ?`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
