import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : error.message);
      return;
    }
    toast.success("Bienvenue !");
    navigate({ to: search.redirect ?? "/dashboard" });
  };

  return (
    <AuthShell title="Bienvenue" subtitle="Connectez-vous à votre espace restaurateur">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email" icon="📧">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="auth-input"
          />
        </Field>
        <Field label="Mot de passe" icon="🔒">
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

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-4 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold hover:shadow-gold hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Pas encore inscrit ?{" "}
        <Link to="/auth/inscription" className="text-gold font-bold hover:text-gold-light">
          Créer mon restaurant
        </Link>
      </p>

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
