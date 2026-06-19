import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/auth/inscription")({
  head: () => ({
    meta: [
      { title: "Inscription — Resto BF" },
      { name: "description", content: "Créez votre espace restaurateur sur Resto BF en 2 minutes." },
    ],
  }),
  component: SignupPage,
});

const cuisines = ["Maquis / Grillades", "Restaurant traditionnel", "Fast-food", "Cafétéria", "Pizzeria", "Autre"];

type PlanId = "gratuit" | "standard" | "premium";
const plans: { id: PlanId; icon: string; name: string; price: string; features: string[] }[] = [
  { id: "gratuit", icon: "🎁", name: "Gratuit", price: "0 FCFA", features: ["5 plats", "Page publique", "Avis clients"] },
  { id: "standard", icon: "📦", name: "Standard", price: "5 000 F/mois", features: ["30 plats", "WhatsApp", "4 templates"] },
  { id: "premium", icon: "⭐", name: "Premium", price: "10 000 F/mois", features: ["Illimité", "Réservation", "Galerie + QR"] },
];

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    cuisine: cuisines[0],
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    plan: "standard" as PlanId,
    accept: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!form.accept) {
      toast.error("Veuillez accepter les conditions");
      return;
    }
    setLoading(true);

    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          owner_name: form.ownerName,
          restaurant_name: form.name,
          city: form.city,
          cuisine: form.cuisine,
          phone: form.phone,
          plan: form.plan,
        },
      },
    });

    if (authError) {
      setLoading(false);
      toast.error(authError.message);
      return;
    }

    setLoading(false);
    toast.success("Compte créé ! Vérifiez votre email puis choisissez votre template.");
    navigate({ to: "/auth/choisir-template" });
  };

  return (
    <AuthShell title="Créer mon restaurant" subtitle="Ouvrez votre espace en 2 minutes" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nom du restaurant *" icon="🏪">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Maquis Le Karité" className="auth-input" />
          </Field>
          <Field label="Ville *" icon="📍">
            <input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ouagadougou" className="auth-input" />
          </Field>
        </div>

        <Field label="Type de cuisine" icon="🍽️">
          <select value={form.cuisine} onChange={(e) => set("cuisine", e.target.value)} className="auth-input appearance-none cursor-pointer">
            {cuisines.map((c) => (
              <option key={c} value={c} className="bg-[#111118]">{c}</option>
            ))}
          </select>
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nom du gérant *" icon="👤">
            <input required value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} placeholder="Aminata Konaté" className="auth-input" />
          </Field>
          <Field label="WhatsApp *" icon="📱">
            <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+226 70 00 00 00" className="auth-input" />
          </Field>
        </div>

        <Field label="Email *" icon="📧">
          <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="votre@email.com" className="auth-input" />
        </Field>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
            Choisissez votre abonnement
          </label>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {plans.map((p) => {
              const active = form.plan === p.id;
              return (
                <label key={p.id} className="cursor-pointer">
                  <input type="radio" name="plan" value={p.id} checked={active} onChange={() => set("plan", p.id)} className="sr-only" />
                  <div
                    className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                      active
                        ? "border-gold bg-gold/8 shadow-[0_0_20px_rgba(212,168,83,0.15)]"
                        : "border-white/10 bg-white/[0.02] hover:border-gold/30"
                    }`}
                  >
                    {p.id === "standard" && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-gold text-[#0a0a0f] text-[9px] font-black uppercase tracking-wider">
                        Populaire
                      </span>
                    )}
                    <div className="text-2xl mb-1">{p.icon}</div>
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className={`font-black text-base mt-1 ${active ? "text-gold" : "text-foreground"}`}>{p.price}</div>
                    <ul className="mt-2 text-[10px] text-muted-foreground text-left space-y-0.5">
                      {p.features.map((f) => (
                        <li key={f}>
                          <span className="text-gold">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Mot de passe *" icon="🔒">
            <input required type="password" minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 6 caractères" className="auth-input" />
          </Field>
          <Field label="Confirmer *" icon="🔒">
            <input required type="password" minLength={6} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="Retapez" className="auth-input" />
          </Field>
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={form.accept} onChange={(e) => set("accept", e.target.checked)} className="mt-0.5 w-4 h-4 accent-gold" />
          <span>
            J'accepte les <a href="#contact" className="text-gold font-bold">conditions générales</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-4 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? "Création..." : "✨ Créer mon espace restaurateur"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/auth/connexion" className="text-gold font-bold hover:text-gold-light">
            Se connecter
          </Link>
        </p>

        <div className="mt-2 p-4 rounded-2xl border border-gold/15 bg-gold/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-1">🎁 Offre de lancement</p>
          <p className="text-xs text-muted-foreground">
            Les 30 premiers jours sont <strong className="text-green-400">offerts</strong> sur le plan Premium. Aucune carte bancaire.
          </p>
        </div>
      </form>

      <style>{`
        .auth-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e8e6e3;
          font-size: 15px;
          outline: none;
          transition: all 0.25s;
        }
        .auth-input:focus {
          border-color: #d4a853;
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(212,168,83,0.12);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </AuthShell>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base opacity-70 z-10">{icon}</span>
        {children}
      </div>
    </div>
  );
}
