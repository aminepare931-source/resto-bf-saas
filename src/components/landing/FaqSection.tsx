import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarX,
  ChefHat,
  ChevronDown,
  MessageCircle,
  Timer,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { DiamondPattern } from "./DiamondPattern";

const C = {
  bg: "#fdf9ef",
  ink: "#2b130b",
  muted: "#6d5a50",
  accent: "#c4420f",
  line: "#f0e4d6",
  tint: "#fdeadc",
};
const serif = { fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif" } as const;

const FAQS: { icon: LucideIcon; q: string; a: string }[] = [
  {
    icon: Timer,
    q: "En combien de temps mon restaurant sera-t-il en ligne ?",
    a: "Votre espace est créé instantanément en 5 minutes. Une fois inscrit, vous ajoutez vos plats, fixez vos prix et personnalisez votre logo. Votre lien et votre QR Code sont immédiatement prêts à être partagés.",
  },
  {
    icon: Wallet,
    q: "Faut-il payer à l'inscription ?",
    a: "Non ! Vous bénéficiez de 30 jours d'essai 100% gratuit, sans aucune carte bancaire ni frais cachés. À la fin des 30 jours, vous décidez librement de poursuivre avec l'abonnement de votre choix.",
  },
  {
    icon: MessageCircle,
    q: "Comment fonctionnent les commandes WhatsApp ?",
    a: "Chaque plat affiché sur votre menu possède un bouton « Commander ». Lorsque le client clique, un message pré-rempli contenant la liste des plats, le total en FCFA et ses coordonnées s'ouvre directement sur votre numéro WhatsApp.",
  },
  {
    icon: ChefHat,
    q: "Comment fonctionne la gestion de cuisine ?",
    a: "Vous disposez d'un écran cuisine utilisable sur téléphone ou tablette. Chaque nouvelle commande s'y affiche avec son statut (Nouveau, En préparation, Prêt). Les cuisiniers peuvent valider les plats d'une simple touche.",
  },
  {
    icon: Users,
    q: "Mes employés peuvent-ils avoir leurs propres accès ?",
    a: "Oui, vous pouvez créer des comptes spécifiques pour vos serveurs, cuisiniers et gérants. Chaque rôle n'accède qu'aux fonctionnalités dont il a besoin.",
  },
  {
    icon: CalendarX,
    q: "Est-ce que je peux résilier à tout moment ?",
    a: "Absolument. Il n'y a aucun engagement de durée. Vous pouvez suspendre ou résilier votre abonnement sans pénalité en un clic.",
  },
];

export function FaqSection() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden px-4 sm:px-6 pt-16 pb-12 sm:pt-24"
      style={{ background: C.bg, color: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      />
      <DiamondPattern
        className="absolute top-0 right-0 w-[150px] h-[170px] sm:w-[260px] sm:h-[220px]"
        opacity={0.1}
        fade="radial-gradient(circle at 100% 0%, #000 25%, transparent 72%)"
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <span
          className="inline-block rounded-full px-5 py-2 text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.14em]"
          style={{ color: C.accent, background: "#fff", border: `1px solid ${C.line}` }}
        >
          Questions fréquentes
        </span>
        <h2
          className="mt-5 text-[2.5rem] sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight"
          style={serif}
        >
          Tout ce que vous devez <span style={{ color: C.accent }}>savoir</span>
        </h2>
        <p className="mt-5 text-[16px] sm:text-[17.5px] leading-relaxed" style={{ color: C.muted }}>
          Vous avez des questions ? Voici les réponses aux questions les plus fréquentes sur
          RestoBF. Si vous ne trouvez pas votre réponse, notre équipe est là pour vous aider.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto mt-10 space-y-3.5">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-[22px] overflow-hidden transition-colors duration-300"
              style={{
                background: isOpen ? "#fdeee3" : "#fffdf9",
                border: `1px solid ${isOpen ? "#f3c9ab" : C.line}`,
                boxShadow: isOpen
                  ? "0 14px 30px -18px rgba(196,66,15,.35)"
                  : "0 6px 16px -10px rgba(80,40,20,.18)",
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full text-left flex items-start gap-4 p-4 sm:p-5 cursor-pointer"
              >
                <span
                  className="shrink-0 w-[52px] h-[52px] rounded-full grid place-items-center"
                  style={{ background: isOpen ? "#f9d9c2" : C.tint, color: C.accent }}
                >
                  <f.icon className="w-6 h-6" strokeWidth={1.8} />
                </span>
                <span className="flex-1 min-w-0 self-center">
                  <span className="block text-[16px] sm:text-[17.5px] font-semibold leading-snug">
                    {f.q}
                  </span>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.span
                        key="a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="block overflow-hidden"
                      >
                        <span
                          className="block pt-3 pb-1 text-[14.5px] sm:text-[15.5px] leading-relaxed"
                          style={{ color: C.muted }}
                        >
                          {f.a}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 mt-3.5"
                  style={{ color: C.accent }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
