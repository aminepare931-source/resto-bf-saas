import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Interactive3DButton } from "@/components/landing/Interactive3DButton";
import { signupSchema, firstZodError } from "@/lib/validation";
import {
  Store,
  MapPin,
  Utensils,
  User,
  Phone,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const searchSchema = z.object({
  plan: z.enum(["trial", "basique", "standard", "premium"]).optional(),
});

export const Route = createFileRoute("/auth/inscription")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Inscription — Resto BF" },
      {
        name: "description",
        content: "Créez votre espace restaurateur sur Resto BF en 2 minutes.",
      },
    ],
  }),
  component: SignupPage,
});

const cuisines = [
  "Maquis / Grillades",
  "Restaurant traditionnel",
  "Fast-food & Burger",
  "Cafétéria & Lounge",
  "Pizzeria & Pastas",
  "Traiteur / Événementiel",
  "Autre concept",
];

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
    try {
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
    } catch (err) {
      setLoading(false);
      toast.error("Erreur lors de la création du compte");
      return;
    }

    setLoading(false);
    toast.success(
      selectedPlan && selectedPlan !== "trial"
        ? "Compte créé ! Votre forfait " + selectedPlan + " est prêt."
        : "Compte créé ! Votre essai gratuit de 30 jours démarre maintenant.",
    );
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
    <AuthShell
      title="Créer mon Restaurant"
      subtitle="Essai 100% gratuit 30 jours — Sans carte bancaire requise"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Banner trial highlight */}
        <div className="p-4 rounded-2xl border border-[#d4a853]/40 bg-gradient-to-r from-[#d4a853]/15 via-[#f0d48a]/10 to-transparent flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-[#d4a853]/20 border border-[#d4a853]/40 flex items-center justify-center shrink-0 text-[#f0d48a]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#f0d48a]">
              Offre Spéciale Lancement Burkina
            </p>
            <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed">
              30 jours d'essai complets offerts avec accès à la gestion des commandes, menus QR
              code, et WhatsApp direct.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nom du restaurant *" icon={<Store className="w-4 h-4 text-[#d4a853]" />}>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Maquis Le Karité"
              className="auth-input"
            />
          </Field>

          <Field label="Ville *" icon={<MapPin className="w-4 h-4 text-[#d4a853]" />}>
            <input
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Ouagadougou"
              className="auth-input"
            />
          </Field>
        </div>

        <Field label="Type de cuisine *" icon={<Utensils className="w-4 h-4 text-[#d4a853]" />}>
          <select
            value={form.cuisine}
            onChange={(e) => set("cuisine", e.target.value)}
            className="auth-input appearance-none cursor-pointer bg-[#111118]"
          >
            {cuisines.map((c) => (
              <option key={c} value={c} className="bg-[#1a1a24] text-foreground">
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nom du gérant *" icon={<User className="w-4 h-4 text-[#d4a853]" />}>
            <input
              required
              value={form.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              placeholder="Aminata Konaté"
              className="auth-input"
            />
          </Field>

          <Field label="Numéro WhatsApp *" icon={<Phone className="w-4 h-4 text-[#d4a853]" />}>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+226 70 00 00 00"
              className="auth-input"
            />
          </Field>
        </div>

        <Field label="Adresse Email *" icon={<Mail className="w-4 h-4 text-[#d4a853]" />}>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="votre@email.com"
            className="auth-input"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Mot de passe *" icon={<Lock className="w-4 h-4 text-[#d4a853]" />}>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 8 caractères"
              className="auth-input"
            />
          </Field>

          <Field
            label="Confirmer mot de passe *"
            icon={<Lock className="w-4 h-4 text-[#d4a853]" />}
          >
            <input
              required
              type="password"
              minLength={8}
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              placeholder="Retapez le mot de passe"
              className="auth-input"
            />
          </Field>
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground mt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.accept}
            onChange={(e) => set("accept", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#d4a853] rounded"
          />
          <span>
            J'accepte les{" "}
            <a href="#contact" className="text-[#f0d48a] font-bold hover:underline">
              conditions d'utilisation
            </a>{" "}
            et confirme exercer au Burkina Faso.
          </span>
        </label>

        <Interactive3DButton
          type="submit"
          disabled={loading}
          variant="gold-glow"
          size="lg"
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full mt-2 shadow-[0_0_30px_rgba(212,168,83,0.4)]"
        >
          {loading ? "Création du compte..." : "✨ Démarrer mon essai gratuit 30 jours"}
        </Interactive3DButton>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111118] px-3 text-muted-foreground font-semibold">
              ou s'inscrire avec
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#d4a853]/40 font-bold text-xs text-foreground transition-all disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.03 2.53-2.16 3.31v2.77h3.49c2.04-1.88 3.24-4.64 3.24-7.89z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.49-2.77c-.98.66-2.23 1.06-3.79 1.06-2.91 0-5.37-1.96-6.25-4.63H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.75 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.72-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.64 0 3.11.56 4.27 1.67l3.2-3.2C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.57 2.84c.88-2.67 3.34-4.53 6.25-4.53z"
            />
          </svg>
          <span>S'inscrire avec Google</span>
        </button>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Déjà un compte ?{" "}
          <Link to="/auth/connexion" className="text-[#f0d48a] font-extrabold hover:underline">
            Se connecter directement
          </Link>
        </p>
      </form>

      <style>{`
        .auth-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(212,168,83,0.2);
          border-radius: 12px;
          color: #f3f3f3;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-input:focus {
          border-color: #f0d48a;
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 15px rgba(212,168,83,0.25);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
    </AuthShell>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 opacity-90">{icon}</span>
        {children}
      </div>
    </div>
  );
}
