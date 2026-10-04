import { useEffect } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";

const SUPPORT_PHONE = "+226 55 30 08 68";
const SUPPORT_PHONE_TEL = "+22655300868";
const SUPPORT_WA = "22655300868";
const SUPPORT_EMAIL = "aminepare931@gmail.com";

export function SubscribeContactModal({
  open,
  onClose,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  plan?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const waMsg = encodeURIComponent(
    `Bonjour, je souhaite activer mon abonnement RestoBF${plan ? ` (${plan})` : ""}.`,
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-gold/30 bg-card shadow-level3 overflow-hidden animate-scale-in"
      >
        <div className="p-6 bg-gradient-to-br from-gold/10 to-transparent border-b border-border/60">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold mb-2">
            Activation d'abonnement
          </p>
          <h3 className="text-xl font-black text-foreground">Contactez notre assistance</h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/85 leading-relaxed">
            Les paiements électroniques sont actuellement en cours d'intégration. Pour activer votre
            abonnement
            {plan ? <strong className="text-gold"> {plan}</strong> : null}, veuillez contacter notre
            équipe.
          </p>

          <div className="rounded-2xl border border-border/60 bg-surface-warm p-4 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Responsable
            </p>
            <strong className="block text-base">Mohamed Amine Paré</strong>
            <p className="text-sm text-gold font-mono">{SUPPORT_PHONE}</p>
          </div>

          <div className="grid gap-2">
            <a
              href={`https://wa.me/${SUPPORT_WA}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald text-white font-bold text-sm hover:bg-emerald-deep transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Contacter sur WhatsApp
            </a>
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold text-sm hover:shadow-gold transition-shadow"
            >
              <Phone className="h-4 w-4" /> Appeler maintenant
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Activation%20abonnement%20Resto%20BF`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-input hover:border-gold/40 text-sm font-semibold transition-colors"
            >
              <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export const SUPPORT_CONTACT = {
  phone: SUPPORT_PHONE,
  phoneTel: SUPPORT_PHONE_TEL,
  whatsapp: SUPPORT_WA,
  email: SUPPORT_EMAIL,
  manager: "Mohamed Amine Paré",
};
