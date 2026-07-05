import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";
import { useStaffRole } from "@/hooks/use-staff-role";
import { UserPlus, Trash2, Shield, ChefHat, User, Eye, EyeOff, Copy, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StaffCardSkeleton } from "@/components/ui/skeleton";
import type { StaffMember, StaffRole } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/staff")({
  component: StaffPage,
});

const ROLE_ICONS: Record<StaffRole, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  cuisinier: <ChefHat className="w-4 h-4" />,
  serveur: <User className="w-4 h-4" />,
  manager: <User className="w-4 h-4" />,
};

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Administrateur",
  cuisinier: "Cuisinier",
  serveur: "Serveur",
  manager: "Manager",
};

function StaffPage() {
  const { restaurant: r } = useMyRestaurant();
  const { isAdmin, loading: roleLoading } = useStaffRole();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "cuisinier" as StaffRole,
    pin: "",
  });

  useEffect(() => {
    if (isAdmin && r) {
      loadStaff();
    }
  }, [isAdmin, r?.id]);

  const loadStaff = async () => {
    if (!r) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("restaurant_id", r.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Erreur lors du chargement du personnel");
    } finally {
      setLoading(false);
    }
  };

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const addStaffMember = async () => {
    if (!r || !newStaff.name || !newStaff.email) {
      toast.error("Nom et email requis");
      return;
    }

    try {
      const pin = newStaff.pin || generatePin();

      const { error: insertError } = await supabase.from("staff_members").insert({
        restaurant_id: r.id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone || null,
        role: newStaff.role,
        pin: pin,
        is_active: true,
      });

      if (insertError) throw insertError;

      toast.success(`✅ Membre ajouté ! PIN: ${pin}`, { duration: 10000 });
      setShowAddModal(false);
      setNewStaff({
        name: "",
        email: "",
        phone: "",
        role: "cuisinier",
        pin: "",
      });
      loadStaff();
    } catch (error: any) {
      console.error("Error adding staff:", error);
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  const updateStaffMember = async () => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from("staff_members")
        .update({
          name: editingMember.name,
          email: editingMember.email,
          phone: editingMember.phone,
          role: editingMember.role,
          pin: editingMember.pin,
        })
        .eq("id", editingMember.id);

      if (error) throw error;

      toast.success("✅ Membre modifié avec succès");
      setShowEditModal(false);
      setEditingMember(null);
      loadStaff();
    } catch (error: any) {
      console.error("Error updating staff:", error);
      toast.error(error.message || "Erreur lors de la modification");
    }
  };

  const toggleStaffStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("staff_members")
        .update({ is_active: !currentStatus })
        .eq("id", staffId);

      if (error) throw error;

      toast.success(currentStatus ? "Membre désactivé" : "Membre activé");
      loadStaff();
    } catch (error) {
      console.error("Error toggling staff status:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteStaffMember = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from("staff_members")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      toast.success("Membre supprimé");
      setDeleteTarget(null);
      loadStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("PIN copié !");
  };

  if (roleLoading) return <p className="text-muted-foreground">Chargement...</p>;
  if (!isAdmin) {
    return (
      <div className="max-w-2xl p-8 rounded-3xl border border-red-500/30 bg-red-500/5 text-center">
        <Shield className="w-12 h-12 mx-auto mb-3 text-red-400" />
        <h2 className="text-2xl font-black mb-2">Accès refusé</h2>
        <p className="text-sm text-muted-foreground">
          Cette page est réservée à l'administrateur du restaurant.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Gestion</p>
        <h1 className="text-3xl font-black">Personnel</h1>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-white/8 bg-dark-card">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-black">{staff.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/8 bg-dark-card">
          <p className="text-xs text-muted-foreground mb-1">Actifs</p>
          <p className="text-2xl font-black text-emerald-400">
            {staff.filter((s) => s.is_active).length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/8 bg-dark-card">
          <p className="text-xs text-muted-foreground mb-1">Cuisiniers</p>
          <p className="text-2xl font-black text-blue-400">
            {staff.filter((s) => s.role === "cuisinier").length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/8 bg-dark-card">
          <p className="text-xs text-muted-foreground mb-1">Serveurs</p>
          <p className="text-2xl font-black text-gold">
            {staff.filter((s) => s.role === "serveur").length}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Membres de l'équipe</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-gradient-gold text-[#0a0a0f] text-sm font-bold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <StaffCardSkeleton key={i} />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-white/15 text-center text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun membre dans l'équipe</p>
          <p className="text-xs mt-1">Commencez par ajouter des membres</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className={`p-5 rounded-2xl border transition-all ${
                member.is_active
                  ? "border-white/8 bg-dark-card"
                  : "border-white/5 bg-white/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                    {ROLE_ICONS[member.role] || <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{member.name}</h3>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                    {member.phone && (
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-gold/10 text-gold text-xs font-semibold">
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                      {member.pin && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs font-mono">
                          PIN: {visiblePins[member.id] ? member.pin : "••••"}
                          <button
                            onClick={() => setVisiblePins({ ...visiblePins, [member.id]: !visiblePins[member.id] })}
                            className="hover:text-blue-300"
                          >
                            {visiblePins[member.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(member.pin!)}
                            className="hover:text-blue-300"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingMember({ ...member });
                      setShowEditModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground text-xs font-semibold"
                    title="Modifier"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleStaffStatus(member.id, member.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      member.is_active
                        ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {member.is_active ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(member)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un membre">
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Nom complet *</label>
            <input
              type="text"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Email *</label>
            <input
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
              placeholder="jean@restaurant.com"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Téléphone</label>
            <input
              type="tel"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
              placeholder="+226 01 02 03 04"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Rôle</label>
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as StaffRole })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
            >
              <option value="cuisinier">Cuisinier</option>
              <option value="serveur">Serveur</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">PIN (4 chiffres) - Optionnel</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStaff.pin}
                onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                maxLength={4}
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-center text-lg tracking-widest"
                placeholder="Auto"
              />
              <button
                type="button"
                onClick={() => setNewStaff({ ...newStaff, pin: generatePin() })}
                className="px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5"
              >
                Générer
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Laissez vide pour générer automatiquement</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={addStaffMember}
            className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm"
          >
            Ajouter
          </button>
        </div>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingMember(null); }}
        title={`Modifier ${editingMember?.name || ""}`}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Nom complet</label>
            <input
              type="text"
              value={editingMember?.name || ""}
              onChange={(e) => setEditingMember((prev) => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Email</label>
            <input
              type="email"
              value={editingMember?.email || ""}
              onChange={(e) => setEditingMember((prev) => prev ? { ...prev, email: e.target.value } : null)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Téléphone</label>
            <input
              type="tel"
              value={editingMember?.phone || ""}
              onChange={(e) => setEditingMember((prev) => prev ? { ...prev, phone: e.target.value } : null)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Rôle</label>
            <select
              value={editingMember?.role || "cuisinier"}
              onChange={(e) => setEditingMember((prev) => prev ? { ...prev, role: e.target.value as StaffRole } : null)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm"
            >
              <option value="cuisinier">Cuisinier</option>
              <option value="serveur">Serveur</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Nouveau PIN (4 chiffres)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingMember?.pin || ""}
                onChange={(e) => setEditingMember((prev) => prev ? { ...prev, pin: e.target.value.replace(/\D/g, "").slice(0, 4) } : null)}
                maxLength={4}
                className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-center text-lg tracking-widest"
                placeholder={editingMember?.pin || "Nouveau PIN"}
              />
              <button
                type="button"
                onClick={() => setEditingMember((prev) => prev ? { ...prev, pin: generatePin() } : null)}
                className="px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5"
              >
                Générer
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Laissez vide pour garder l'ancien PIN</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={() => { setShowEditModal(false); setEditingMember(null); }}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={updateStaffMember}
            className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm"
          >
            Enregistrer
          </button>
        </div>
      </Modal>

      {/* Dialogue de confirmation suppression */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteStaffMember}
        title="Supprimer un membre"
        message={`Êtes-vous sûr de vouloir supprimer ${deleteTarget?.name} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}