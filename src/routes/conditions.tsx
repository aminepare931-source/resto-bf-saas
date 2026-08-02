import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LSection } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/conditions")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — RestoBF" },
      { name: "description", content: "Les règles d'utilisation de la plateforme RestoBF." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Conditions d'utilisation" updated="24 juillet 2026">
      <p>
        En créant un compte ou en utilisant la plateforme RestoBF, vous acceptez les présentes
        conditions. Merci de les lire attentivement.
      </p>

      <LSection title="1. Le service">
        <p>
          RestoBF est une plateforme SaaS qui permet aux restaurants, maquis et fast-foods de créer
          un site en ligne (menu digital, galerie, avis), de recevoir des commandes et des
          réservations, et de gérer leur activité (cuisine, stocks, facturation, statistiques)
          depuis un tableau de bord.
        </p>
      </LSection>

      <LSection title="2. Création de compte">
        <ul>
          <li>Vous devez fournir des informations exactes lors de la création de votre compte</li>
          <li>Vous êtes responsable de la confidentialité de votre mot de passe</li>
          <li>
            Vous devez avoir l'autorité nécessaire pour représenter le restaurant que vous inscrivez
          </li>
          <li>
            Un compte correspond à un restaurant. Vous pouvez inviter des membres de votre équipe
            (personnel de cuisine, salle) selon les fonctionnalités de votre abonnement
          </li>
        </ul>
      </LSection>

      <LSection title="3. Abonnements et tarifs">
        <p>RestoBF propose plusieurs formules :</p>
        <ul>
          <li>
            <strong>Basique</strong> — 30 jours d'essai gratuit, puis 2 500 FCFA/mois
          </li>
          <li>
            <strong>Standard</strong> — 5 000 FCFA/mois
          </li>
          <li>
            <strong>Premium</strong> — 7 500 FCFA/mois
          </li>
          <li>
            <strong>Sur mesure</strong> — tarif établi sur devis selon vos besoins spécifiques
          </li>
        </ul>
        <p>
          Les tarifs peuvent évoluer. En cas de changement, vous en serez informé à l'avance. Vous
          pouvez changer de formule ou résilier votre abonnement à tout moment depuis votre tableau
          de bord ; la résiliation prend effet à la fin de la période déjà payée.
        </p>
      </LSection>

      <LSection title="4. Vos contenus">
        <p>
          Vous restez propriétaire de tous les contenus que vous publiez sur votre site (photos,
          description, menu, textes). En les publiant sur RestoBF, vous nous autorisez à les
          héberger et à les afficher publiquement dans le cadre du fonctionnement du service.
        </p>
        <p>Vous vous engagez à ne pas publier de contenu :</p>
        <ul>
          <li>Illégal, trompeur ou frauduleux</li>
          <li>Portant atteinte aux droits d'un tiers (image, propriété intellectuelle)</li>
          <li>Contraire à l'ordre public</li>
        </ul>
      </LSection>

      <LSection title="5. Commandes et réservations">
        <p>
          RestoBF fournit l'outil technique permettant à vos clients de commander et réserver en
          ligne. La relation commerciale (préparation, tarification, qualité, livraison, litiges
          liés à une commande) reste entièrement entre vous et votre client — RestoBF n'est ni
          vendeur ni intermédiaire commercial dans cette relation.
        </p>
      </LSection>

      <LSection title="6. Disponibilité du service">
        <p>
          Nous faisons notre possible pour maintenir la plateforme accessible et fonctionnelle, mais
          ne pouvons garantir une disponibilité ininterrompue (maintenance, incidents techniques,
          cas de force majeure). Nous vous informerons en cas d'interruption prolongée prévisible.
        </p>
      </LSection>

      <LSection title="7. Résiliation">
        <p>
          Vous pouvez résilier votre compte à tout moment. Nous nous réservons le droit de suspendre
          ou résilier un compte en cas de non-respect de ces conditions, de non-paiement, ou
          d'utilisation frauduleuse ou abusive de la plateforme.
        </p>
      </LSection>

      <LSection title="8. Limitation de responsabilité">
        <p>
          RestoBF est fourni "en l'état". Dans la mesure permise par la loi applicable, nous ne
          pourrons être tenus responsables des pertes indirectes (perte de chiffre d'affaires, de
          clientèle) résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
        </p>
      </LSection>

      <LSection title="9. Modifications">
        <p>
          Nous pouvons modifier ces conditions. Les changements importants vous seront communiqués à
          l'avance. La poursuite de l'utilisation du service après une modification vaut acceptation
          des nouvelles conditions.
        </p>
      </LSection>

      <LSection title="10. Contact">
        <p>
          Pour toute question : <a href="mailto:aminepare931@gmail.com">aminepare931@gmail.com</a> ·{" "}
          <a href="https://wa.me/22655300868">WhatsApp</a>
        </p>
      </LSection>
    </LegalLayout>
  );
}
