import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { renderTemplate } from "@/components/public/templates";
import { demoData } from "@/components/public/demo-data";

const PREMIUM_FEU_BG = "/premium-bgs/premium-feu-bg.png";
const PREMIUM_GRILL_BG = "/premium-bgs/premium-grill-bg.png";
const PREMIUM_ORANGE_BG = "/premium-bgs/premium-orange-bg.png";
const PREMIUM_PASTA_BG = "/premium-bgs/premium-pasta-bg.png";

export const Route = createFileRoute("/_authenticated/dashboard/templates")({
  component: DashboardTemplates,
});

type PlanTier = "basique" | "standard" | "premium";
type Tpl = { id: string; name: string; tagline: string; plan: PlanTier; vibe: string };

const templates: Tpl[] = [
  { id: "gratuit-classique", name: "Classique", tagline: "Swiss minimal noir/blanc", plan: "basique", vibe: "linear-gradient(135deg,#1a1a24,#0a0a0f)" },
  { id: "std-soleil", name: "Soleil", tagline: "Éditorial chaleureux crème", plan: "standard", vibe: "linear-gradient(135deg,#d4a853,#b08800)" },
  { id: "std-savane", name: "Savane", tagline: "Ocre & rust africain", plan: "standard", vibe: "linear-gradient(135deg,#b95036,#7a2e1d)" },
  { id: "std-marche", name: "Marché", tagline: "Couleurs vives Sankariaré", plan: "standard", vibe: "linear-gradient(135deg,#0f6b4f,#0a4f3a)" },
  { id: "std-moderne", name: "Moderne", tagline: "Épuré contemporain", plan: "standard", vibe: "linear-gradient(135deg,#2c3e50,#1a1a2e)" },
  { id: "prem-royal", name: "Palais Royal", tagline: "Or, QR, cave, événements", plan: "premium", vibe: `url(${PREMIUM_ORANGE_BG}) center/cover` },
  { id: "prem-nuit", name: "Aurum Nuit", tagline: "Fine dining sombre animé", plan: "premium", vibe: `url(${PREMIUM_PASTA_BG}) center/cover` },
  { id: "prem-feu", name: "Ignis Feu", tagline: "Braises animées & grillades", plan: "premium", vibe: `url(${PREMIUM_FEU_BG}) center/cover` },
  { id: "prem-luxe", name: "Luxe Grill", tagline: "Grande réservation + QR", plan: "premium", vibe: `url(${PREMIUM_GRILL_BG}) center/cover` },
];

const planRank: Record<PlanTier, number> = { basique: 0, standard: 1, premium: 2 };

function planToTier(plan: string): PlanTier {
  if (plan === "premium" || plan === "sur_mesure") return "premium";
  if (plan === "standard" || plan === "trial") return "standard";
  return "basique";
}

function DashboardTemplates() {
  const navigate = useNavigate();
  const { restaurant: r } = useMyRestaurant();
  const [userPlan, setUserPlan] = useState<PlanTier>("standard");
  const [planLabel, setPlanLabel] = useState<string>("essai");
  const [selected, setSelected] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!r) return;
    setUserPlan(planToTier(r.plan));
    setPlanLabel(r.plan);
    setSelected(r.template ?? null);
  }, [r]);

  const canPick = (p: Tpl["plan"]) => planRank[userPlan] >= planRank[p];

  const save = async () => {
    if (!selected) return;
    const tpl = templates.find((t) => t.id === selected);
    if (!tpl) return;
    if (!canPick(tpl.plan)) {
      toast.error("Ce template demande un forfait supérieur.");
      return;
    }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("restaurants").update({ template: selected }).eq("user_id", u.user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Template enregistré !");
  };

const grouped = {
  basique: templates.filter((t) => t.plan === "basique"),
  standard: templates.filter((t) => t.plan === "standard"),
  premium: templates.filter((t) => t.plan === "premium"),
};

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Personnalisation</p>
        <h1 className="text-3xl font-black">Templates</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Choisissez le design de votre site public. Vous pouvez le changer à tout moment.
        </p>
      </div>

      {/* Plan info banner */}
      <div className="rounded-2xl border border-white/8 bg-dark-card p-5 mb-8 flex flex-wrap items-center gap-3">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Forfait actif</span>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-gold text-[#0a0a0f]">
          {userPlan === "premium" ? "⭐ Premium" : userPlan === "standard" ? "📣 Standard" : "🎁 Gratuit / Essai"}
        </span>
        {userPlan !== "premium" && (
          <span className="text-xs text-muted-foreground">
            Passez Premium pour débloquer les 4 templates animés exclusifs.
          </span>
        )}
        {userPlan === "premium" && (
          <span className="text-xs text-emerald-400 font-bold ml-auto">
            ✅ Tous les templates Premium sont débloqués
          </span>
        )}
      </div>

      {/* Template grid */}
      <div className="space-y-10">
        {(["basique", "standard", "premium"] as const).map((plan) => (
          <div key={plan}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gold">
              {plan === "basique" ? "🎁 Basique" : plan === "standard" ? "📦 Standard" : "⭐ Premium"}
              </h3>
              {plan === "premium" && (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gold/20 text-gold">
                  Animés
                </span>
              )}
              {!canPick(plan) && (
                <span className="text-xs text-muted-foreground">(aperçu seulement — upgrade requis)</span>
              )}
              {canPick(plan) && plan === "premium" && (
                <span className="text-xs text-emerald-400">✅ Débloqué</span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {grouped[plan].map((t) => {
                const locked = !canPick(t.plan);
                const active = selected === t.id;
                return (
                  <div key={t.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setPreviewId(t.id)}
                      className={`relative aspect-[4/5] w-full rounded-2xl border-2 overflow-hidden text-left transition-all ${
                        active ? "border-gold shadow-gold scale-[1.02]" : "border-white/10 hover:border-gold/40 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="absolute inset-0" style={{ background: t.vibe }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {locked && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-gold/90 backdrop-blur-sm border border-gold/30">
                          🔒 {t.plan}
                        </div>
                      )}
                      {active && (
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-[#0a0a0f] font-black text-sm shadow-gold">
                          ✓
                        </div>
                      )}
                      {plan === "premium" && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gold/20 text-[10px] font-bold text-gold backdrop-blur-sm border border-gold/30">
                          ✨ Premium
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <span className="px-4 py-2 rounded-lg bg-gold text-[#0a0a0f] text-xs font-bold shadow-gold">
                          👁️ Aperçu
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <strong className="block text-white text-base">{t.name}</strong>
                        <span className="text-xs text-white/70">{t.tagline}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (locked) {
                          toast.error("Ce template demande un forfait supérieur.");
                          return;
                        }
                        setSelected(t.id);
                      }}
                      className={`mt-2 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-gradient-gold text-[#0a0a0f]"
                          : locked
                          ? "bg-white/[0.04] text-muted-foreground cursor-not-allowed border border-white/10"
                          : "bg-white/[0.04] text-foreground border border-white/10 hover:border-gold/40 hover:bg-gold/5"
                      }`}
                    >
                      {active ? "✓ Sélectionné" : locked ? "🔒 Verrouillé" : "Sélectionner"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-white/5">
        <Link to="/dashboard" className="px-5 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:border-gold/40 transition-colors">
          Retour au tableau de bord
        </Link>
        <button
          type="button"
          disabled={!selected || saving}
          onClick={save}
          className="px-7 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold transition-all disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "💾 Enregistrer mon template"}
        </button>
      </div>

      {/* Preview Modal */}
      {previewId && (
        <PreviewModal
          tpl={templates.find((t) => t.id === previewId)!}
          canActivate={canPick(templates.find((t) => t.id === previewId)!.plan)}
          isCurrent={selected === previewId}
          onClose={() => setPreviewId(null)}
          onSelect={() => {
            setSelected(previewId);
            setPreviewId(null);
          }}
        />
      )}
    </div>
  );
}

function PreviewModal({ tpl, canActivate, isCurrent, onClose, onSelect }: { tpl: Tpl; canActivate: boolean; isCurrent: boolean; onClose: () => void; onSelect: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0a0a0f]">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Aperçu — {tpl.plan}</p>
          <strong>{tpl.name}</strong>
          <span className="ml-3 text-xs text-muted-foreground">{tpl.tagline}</span>
        </div>
        <div className="flex items-center gap-2">
          {canActivate ? (
            <button onClick={onSelect} className="px-5 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm">
              {isCurrent ? "✓ Déjà sélectionné" : "Choisir ce template"}
            </button>
          ) : (
            <Link
              to="/dashboard/parametres"
              className="px-5 py-2 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm"
            >
              💎 Passer en Premium
            </Link>
          )}
          <button onClick={onClose} className="w-10 h-10 rounded-xl border border-white/10 hover:border-gold/40 flex items-center justify-center text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        {renderTemplate(tpl.id, demoData)}
      </div>
    </div>
  );
}