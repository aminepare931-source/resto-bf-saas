import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LSection } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — RestoBF" },
      {
        name: "description",
        content: "Comment RestoBF collecte, utilise et protège vos données.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" updated="24 juillet 2026">
      <p>
        RestoBF ("nous", "notre") édite une plateforme SaaS permettant aux restaurants, maquis et
        fast-foods du Burkina Faso de créer un site vitrine, de gérer leur menu digital, leurs
        commandes et leurs réservations. Cette politique explique quelles données nous collectons,
        pourquoi, et comment elles sont protégées.
      </p>

      <LSection title="1. Qui est responsable de vos données">
        <p>
          RestoBF, service édité depuis le Burkina Faso. Pour toute question relative à vos données
          personnelles, vous pouvez nous contacter à{" "}
          <a href="mailto:aminepare931@gmail.com">aminepare931@gmail.com</a> ou au{" "}
          <a href="tel:+22655300868">+226 55 30 08 68</a>.
        </p>
      </LSection>

      <LSection title="2. Données que nous collectons">
        <p>
          <strong>Comptes restaurateurs</strong> — lorsque vous créez un compte pour gérer votre
          restaurant :
        </p>
        <ul>
          <li>Nom, prénom, adresse e-mail, numéro de téléphone</li>
          <li>Nom du restaurant, ville, adresse, horaires, description</li>
          <li>Si vous utilisez la connexion Google : votre nom et votre adresse e-mail Google</li>
          <li>Informations de facturation liées à votre abonnement</li>
        </ul>
        <p className="mt-3">
          <strong>Données des clients de vos restaurants</strong> — lorsqu'un client passe commande
          ou réserve une table via un site RestoBF :
        </p>
        <ul>
          <li>Nom, numéro de téléphone</li>
          <li>
            Détail de la commande ou de la réservation (plats, quantités, table, date, heure, notes)
          </li>
          <li>
            Adresse de livraison, si le restaurant propose la livraison et que le client la choisit
          </li>
        </ul>
        <p className="mt-3">
          <strong>Données techniques</strong> — collectées automatiquement :
        </p>
        <ul>
          <li>Adresse IP, type d'appareil et de navigateur</li>
          <li>Pages visitées, à des fins de fonctionnement et d'amélioration du service</li>
        </ul>
      </LSection>

      <LSection title="3. Pourquoi nous utilisons ces données">
        <ul>
          <li>
            Fournir et faire fonctionner le service (créer votre site, afficher votre menu, traiter
            les commandes et réservations)
          </li>
          <li>Vous permettre de vous connecter (e-mail/mot de passe ou Google)</li>
          <li>
            Vous envoyer des notifications liées à votre activité (nouvelle commande, nouvelle
            réservation)
          </li>
          <li>Assurer la sécurité et prévenir les abus</li>
          <li>Améliorer le service et corriger les problèmes techniques</li>
          <li>Facturer votre abonnement, le cas échéant</li>
        </ul>
        <p>Nous ne vendons jamais vos données ni celles de vos clients à des tiers.</p>
      </LSection>

      <LSection title="4. Avec qui vos données sont partagées">
        <p>Nous faisons appel à des prestataires techniques pour faire fonctionner RestoBF :</p>
        <ul>
          <li>
            <strong>Supabase</strong> — hébergement de la base de données et authentification des
            comptes
          </li>
          <li>
            <strong>Vercel</strong> — hébergement du site et des applications
          </li>
          <li>
            <strong>Google</strong> — uniquement si vous choisissez de vous connecter via "Se
            connecter avec Google"
          </li>
        </ul>
        <p>
          Ces prestataires n'ont accès à vos données que dans la mesure nécessaire à la fourniture
          de leurs services techniques, et ne sont pas autorisés à les utiliser à d'autres fins.
        </p>
      </LSection>

      <LSection title="5. Combien de temps nous conservons vos données">
        <p>
          Vos données sont conservées tant que votre compte est actif. Si vous supprimez votre
          compte, vos données personnelles et celles liées à votre restaurant sont supprimées dans
          un délai raisonnable, sauf obligation légale de conservation plus longue (par exemple à
          des fins comptables).
        </p>
      </LSection>

      <LSection title="6. Vos droits">
        <p>Vous pouvez à tout moment :</p>
        <ul>
          <li>Demander à consulter les données que nous détenons sur vous</li>
          <li>Demander la correction de données inexactes</li>
          <li>Demander la suppression de votre compte et de vos données</li>
          <li>Retirer votre consentement lorsque le traitement en dépend</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{" "}
          <a href="mailto:aminepare931@gmail.com">aminepare931@gmail.com</a>.
        </p>
      </LSection>

      <LSection title="7. Sécurité">
        <p>
          Nous mettons en œuvre des mesures raisonnables (chiffrement des connexions, contrôle
          d'accès aux données) pour protéger vos données contre l'accès non autorisé, la perte ou la
          divulgation. Aucun système n'étant infaillible à 100%, nous vous encourageons à utiliser
          un mot de passe robuste et à ne pas le partager.
        </p>
      </LSection>

      <LSection title="8. Cookies et stockage local">
        <p>
          Nous utilisons le stockage local de votre navigateur pour maintenir votre session
          connectée et mémoriser certaines préférences (par exemple, le contenu de votre panier de
          commande). Nous n'utilisons pas de cookies publicitaires ni de traceurs tiers à des fins
          marketing.
        </p>
      </LSection>

      <LSection title="9. Modifications de cette politique">
        <p>
          Nous pouvons mettre à jour cette politique de temps à autre. En cas de changement
          important, nous vous en informerons par e-mail ou via une notification sur la plateforme.
        </p>
      </LSection>

      <LSection title="10. Contact">
        <p>
          Pour toute question sur cette politique de confidentialité :{" "}
          <a href="mailto:aminepare931@gmail.com">aminepare931@gmail.com</a> ·{" "}
          <a href="https://wa.me/22655300868">WhatsApp</a>
        </p>
      </LSection>
    </LegalLayout>
  );
}
