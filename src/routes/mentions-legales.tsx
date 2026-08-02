import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LSection } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — RestoBF" },
      {
        name: "description",
        content: "Informations légales sur l'éditeur de la plateforme RestoBF.",
      },
    ],
  }),
  component: LegalNoticePage,
});

function LegalNoticePage() {
  return (
    <LegalLayout title="Mentions légales" updated="24 juillet 2026">
      <LSection title="Éditeur du site">
        <p>Le site et la plateforme RestoBF sont édités depuis le Burkina Faso.</p>
        <ul>
          <li>
            Contact : <a href="mailto:aminepare931@gmail.com">aminepare931@gmail.com</a>
          </li>
          <li>
            Téléphone / WhatsApp : <a href="tel:+22655300868">+226 55 30 08 68</a>
          </li>
          <li>Ville : Ouagadougou, Burkina Faso</li>
        </ul>
      </LSection>

      <LSection title="Hébergement">
        <p>Le site et les applications sont hébergés par :</p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis —{" "}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              vercel.com
            </a>
          </li>
          <li>
            <strong>Supabase Inc.</strong> — pour l'hébergement de la base de données et
            l'authentification —{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
              supabase.com
            </a>
          </li>
        </ul>
      </LSection>

      <LSection title="Propriété intellectuelle">
        <p>
          La marque "RestoBF", son logo et l'ensemble des éléments graphiques et techniques de la
          plateforme sont la propriété de leur éditeur, sauf mention contraire. Les contenus publiés
          par chaque restaurant (photos, menu, textes) restent la propriété de ce restaurant.
        </p>
      </LSection>

      <LSection title="Données personnelles">
        <p>
          Le traitement des données personnelles est détaillé dans notre{" "}
          <a href="/confidentialite">Politique de confidentialité</a>.
        </p>
      </LSection>

      <LSection title="Litiges">
        <p>
          Les présentes mentions légales et l'utilisation de la plateforme sont régies par le droit
          burkinabè. En cas de litige, une solution amiable sera recherchée en priorité en nous
          contactant directement.
        </p>
      </LSection>
    </LegalLayout>
  );
}
