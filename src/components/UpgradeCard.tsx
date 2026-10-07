import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { planKey } from "@/lib/plans";

const PLAN_NAME = { basique: "Basique", standard: "Standard", premium: "Premium" } as const;

/** Affichée à la place d'une page dont la fonctionnalité n'est pas incluse dans le forfait. */
export function UpgradeCard({ title, plan }: { title: string; plan?: string | null }) {
  return (
    <div className="max-w-xl mx-auto mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-tint text-amber-deep grid place-items-center">
        <Lock className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-black mb-2">{title} n'est pas inclus dans votre forfait</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Votre forfait actuel : <strong>{PLAN_NAME[planKey(plan)]}</strong>. Passez à un forfait supérieur
        pour débloquer cette fonctionnalité.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-surface-warm"
        >
          Retour à l'aperçu
        </Link>
        <a
          href="/#tarifs"
          className="px-5 py-2.5 rounded-xl bg-terracotta text-white text-sm font-bold hover:bg-terracotta-deep"
        >
          Voir les forfaits
        </a>
      </div>
    </div>
  );
}
