import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type InvoiceColors } from "@/lib/invoice-templates";

const DEFAULT_COLORS: InvoiceColors = {
  primary: "#1a1a1a",
  secondary: "#d4a853",
  text: "#1a1a1a",
  background: "#ffffff",
};

const PRESETS = [
  { name: "Élégant Noir & Or", colors: { primary: "#1a1a1a", secondary: "#d4a853", text: "#1a1a1a", background: "#ffffff" } },
  { name: "Bleu Professionnel", colors: { primary: "#1e3a8a", secondary: "#3b82f6", text: "#1e3a8a", background: "#ffffff" } },
  { name: "Vert Nature", colors: { primary: "#166534", secondary: "#22c55e", text: "#166534", background: "#ffffff" } },
  { name: "Rouge Dynamique", colors: { primary: "#991b1b", secondary: "#ef4444", text: "#991b1b", background: "#ffffff" } },
  { name: "Violet Premium", colors: { primary: "#581c87", secondary: "#a855f7", text: "#581c87", background: "#ffffff" } },
  { name: "Orange Énergique", colors: { primary: "#9a3412", secondary: "#f97316", text: "#9a3412", background: "#ffffff" } },
];

export function InvoiceCustomizer({ restaurantId, onClose, onSaved }: { restaurantId: string; onClose: () => void; onSaved: () => void }) {
  const [colors, setColors] = useState<InvoiceColors>(DEFAULT_COLORS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    const { data } = await supabase
      .from("restaurants")
      .select("invoice_colors")
      .eq("id", restaurantId)
      .single();
    
    if (data?.invoice_colors) {
      setColors(data.invoice_colors as InvoiceColors);
    }
  };

  const saveColors = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("restaurants")
      .update({ invoice_colors: colors })
      .eq("id", restaurantId);
    
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
      return;
    }
    toast.success("Couleurs enregistrées !");
    onSaved();
  };

  const applyPreset = (presetColors: InvoiceColors) => {
    setColors(presetColors);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0f]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black">Personnalisation des factures</h3>
            <p className="text-sm text-muted-foreground mt-1">Choisissez les couleurs de vos factures et reçus</p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Presets */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">
              Thèmes prédéfinis
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.colors)}
                  className="p-3 rounded-xl border border-white/10 hover:border-gold/40 transition-all text-left"
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: preset.colors.primary }} />
                    <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: preset.colors.secondary }} />
                  </div>
                  <p className="text-xs font-semibold">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold block">
              Couleurs personnalisées
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Couleur principale (en-têtes, bordures)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <input
                    type="text"
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm font-mono"
                    placeholder="#1a1a1a"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Couleur secondaire (accents)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <input
                    type="text"
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm font-mono"
                    placeholder="#d4a853"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Couleur du texte</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={colors.text}
                    onChange={(e) => setColors({ ...colors, text: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <input
                    type="text"
                    value={colors.text}
                    onChange={(e) => setColors({ ...colors, text: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm font-mono"
                    placeholder="#1a1a1a"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Couleur de fond</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={colors.background}
                    onChange={(e) => setColors({ ...colors, background: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <input
                    type="text"
                    value={colors.background}
                    onChange={(e) => setColors({ ...colors, background: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">
              Aperçu
            </label>
            <div className="p-6 rounded-xl border border-white/8 bg-dark-card">
              <div className="space-y-3">
                <div className="h-16 rounded-lg" style={{ backgroundColor: colors.primary }} />
                <div className="h-2 rounded w-3/4" style={{ backgroundColor: colors.text }} />
                <div className="h-2 rounded w-1/2" style={{ backgroundColor: colors.text, opacity: 0.6 }} />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="h-12 rounded" style={{ backgroundColor: colors.secondary, opacity: 0.3 }} />
                  <div className="h-12 rounded" style={{ backgroundColor: colors.secondary, opacity: 0.5 }} />
                  <div className="h-12 rounded" style={{ backgroundColor: colors.secondary }} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-white/5">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold hover:border-gold/40 transition-colors">
              Annuler
            </button>
            <button onClick={saveColors} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm hover:shadow-gold transition-all disabled:opacity-60">
              {saving ? "Enregistrement..." : "Enregistrer les couleurs"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}