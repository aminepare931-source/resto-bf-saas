import * as React from "react";
import type { TemplateProps } from "./shared";

/**
 * Dispatcher des templates publics.
 *
 * Chaque template est chargé à la demande (React.lazy) : un restaurant Basique ne
 * télécharge plus le code Premium, et inversement. Les 4 Premium partagent un même
 * fichier, donc un même chunk.
 */

const Premium = {
  royal: React.lazy(() =>
    import("./premium-templates").then((m) => ({ default: m.TplPremiumRoyal })),
  ),
  nuit: React.lazy(() => import("./premium-templates").then((m) => ({ default: m.TplPremiumNuit }))),
  feu: React.lazy(() => import("./premium-templates").then((m) => ({ default: m.TplPremiumFeu }))),
  luxe: React.lazy(() => import("./premium-templates").then((m) => ({ default: m.TplPremiumLuxe }))),
};

const Soleil = React.lazy(() =>
  import("./templates/tpl-soleil").then((m) => ({ default: m.TplSoleil })),
);
const Savane = React.lazy(() =>
  import("./templates/tpl-savane").then((m) => ({ default: m.TplSavane })),
);
const Marche = React.lazy(() =>
  import("./templates/tpl-marche").then((m) => ({ default: m.TplMarche })),
);
const Moderne = React.lazy(() =>
  import("./templates/tpl-moderne").then((m) => ({ default: m.TplModerne })),
);
const Nuit = React.lazy(() => import("./templates/tpl-nuit").then((m) => ({ default: m.TplNuit })));
const Classique = React.lazy(() => import("./templates").then((m) => ({ default: m.TplClassique })));

function TemplateFallback() {
  return (
    <div
      role="status"
      aria-label="Chargement du site"
      style={{ minHeight: "100vh", background: "var(--background, #111)" }}
    />
  );
}

function pick(template: string | null): React.LazyExoticComponent<(p: TemplateProps) => React.ReactElement> {
  switch (template || "prem-royal") {
    case "prem-royal":
      return Premium.royal;
    case "prem-nuit":
      return Premium.nuit;
    case "prem-feu":
      return Premium.feu;
    case "prem-luxe":
      return Premium.luxe;
    case "soleil":
    case "std-soleil":
      return Soleil;
    case "savane":
    case "std-savane":
      return Savane;
    case "marche":
    case "std-marche":
      return Marche;
    case "moderne":
    case "std-moderne":
      return Moderne;
    case "nuit":
    case "std-nuit":
      return Nuit;
    case "classique":
    case "gratuit-classique":
    default:
      return Classique;
  }
}

export function renderTemplate(template: string | null, props: TemplateProps) {
  const Component = pick(template);
  return (
    <React.Suspense fallback={<TemplateFallback />}>
      <Component {...props} />
    </React.Suspense>
  );
}
