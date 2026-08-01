import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Interactive3DButton } from "@/components/landing/Interactive3DButton";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/connexion")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Connexion — Resto BF" },
      { name: "description", content: "Connectez-vous à votre espace restaurateur Resto BF." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/connexion" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(
          error.message === "Invalid login credentials"
            ? "Email ou mot de passe incorrect"
            : error.message,
        );
        return;
      }
      toast.success("Bienvenue !");
      navigate({ to: search.redirect ?? "/dashboard" });
    } catch (err: any) {
      toast.error("Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
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
      title="Espace Restaurateur"
      subtitle="Saisissez vos identifiants pour gérer votre restaurant"
    >
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <Field label="Adresse Email" icon={<Mail className="w-4 h-4 text-[#d4a853]" />}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="restaurateur@domaine.bf"
            className="auth-input"
          />
        </Field>

        <Field label="Mot de passe" icon={<Lock className="w-4 h-4 text-[#d4a853]" />}>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input"
          />
        </Field>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="rounded accent-[#d4a853] w-3.5 h-3.5"
            />
            <span>Rester connecté</span>
          </label>
          <a href="#contact" className="text-[#f0d48a] hover:underline font-semibold">
            Mot de passe oublié ?
          </a>
        </div>

        <Interactive3DButton
          type="submit"
          disabled={loading}
          variant="primary"
          size="lg"
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full mt-2 shadow-[0_0_25px_rgba(212,168,83,0.35)]"
        >
          {loading ? "Connexion en cours..." : "Se connecter à mon espace"}
        </Interactive3DButton>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#111118] px-3 text-muted-foreground font-semibold">
            ou continuer avec
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
        <span>Google Account</span>
      </button>

      <p className="text-center mt-6 text-xs text-muted-foreground">
        Nouveau sur Resto BF ?{" "}
        <Link to="/auth/inscription" className="text-[#f0d48a] font-extrabold hover:underline">
          Créer un compte restaurant (30j gratuits)
        </Link>
      </p>

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
