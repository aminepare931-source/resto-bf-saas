import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { signupSchema, firstZodError } from "@/lib/validation";

const searchSchema = z.object({
  plan: z.enum(["trial", "basique", "standard", "premium"]).optional(),
});

export const Route = createFileRoute("/auth/inscription")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Inscription — Resto BF" },
      { name: "description", content: "Créez votre espace restaurateur sur Resto BF en 2 minutes." },
    ],
  }),
  component: SignupPage,
});

const cuisines = ["Maquis / Grillades", "Restaurant traditionnel", "Fast-food", "Cafétéria", "Pizzeria", "Autre"];

function SignupPage() {
  const navigate = useNavigate();
  const { plan: selectedPlan } = useSearch({ from: "/auth/inscription" });
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
    accept: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(firstZodError(parsed.error));
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
          plan: selectedPlan || "trial",
        },
      },
    });

    if (authError) {
      setLoading(false);
      toast.error(authError.message);
      return;
    }

    setLoading(false);
    toast.success(selectedPlan && selectedPlan !== "trial" ? "Compte créé ! Votre forfait " + selectedPlan + " est prêt." : "Compte créé ! Votre essai gratuit de 30 jours démarre maintenant.");
    navigate({ to: "/auth/choisir-template" });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthShell title="Créer mon restaurant" subtitle="30 jours d'essai gratuit · sans carte bancaire" maxWidth="max-w-2xl">
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
          <select value={form.cuisine} onChange={(e) => set("cuisine", e.target.value)} className="auth-input appearance-none cursor-pointer bg-[#111118]">
            {cuisines.map((c) => (
              <option key={c} value={c} className="bg-[#1a1a24] text-foreground hover:bg-gold/20">{c}</option>
            ))}
          </select>
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nom du gérant *" icon="👤">
            <input required value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} placeholder="Aminata Konaté" className="auth-input" />
          </Field>
          <Field label="WhatsApp *" icon="📱">
            <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+226 55 30 08 68" className="auth-input" />
          </Field>
        </div>

        <Field label="Email *" icon="📧">
          <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="votre@email.com" className="auth-input" />
        </Field>

        <div className="p-4 rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-gold/10 to-transparent">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-1">🎁 Essai gratuit de 30 jours</p>
          <p className="text-sm text-foreground/90">
            Vous accédez à toutes les fonctionnalités sans engagement. Choisissez votre abonnement à la fin de l'essai.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Mot de passe *" icon="🔒">
            <input required type="password" minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 (lettres + chiffres)" className="auth-input" />
          </Field>
          <Field label="Confirmer *" icon="🔒">
            <input required type="password" minLength={8} value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="Retapez" className="auth-input" />
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
          className="mt-2 w-full py-4 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 relative overflow-hidden group"
        >
          <span className="relative z-10">{loading ? "Création..." : "✨ Démarrer mon essai gratuit (30 jours)"}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dark-card px-3 text-muted-foreground">ou</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.03 2.53-2.16 3.31v2.77h3.49c2.04-1.88 3.24-4.64 3.24-7.89z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.49-2.77c-.98.66-2.23 1.06-3.79 1.06-2.91 0-5.37-1.96-6.25-4.63H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.75 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.72-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.64 0 3.11.56 4.27 1.67l3.2-3.2C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.57 2.84c.88-2.67 3.34-4.53 6.25-4.53z"/>
          </svg>
          S'inscrire avec Google
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link to="/auth/connexion" className="text-gold font-bold hover:text-gold-light">
            Se connecter
          </Link>
        </p>
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