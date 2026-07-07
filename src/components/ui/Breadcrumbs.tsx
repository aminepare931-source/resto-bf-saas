import { Link, useRouterState } from "@tanstack/react-router";

interface BreadcrumbItem {
  label: string;
  path: string;
}

/**
 * Mapping des routes vers des libellés lisibles
 */
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  menu: "Menu",
  commandes: "Commandes",
  cuisine: "Cuisine",
  tables: "Tables",
  reservations: "Réservations",
  galerie: "Galerie",
  avis: "Avis clients",
  "qr-code": "QR Code",
  staff: "Personnel",
  chat: "Chat interne",
  messaging: "WhatsApp",
  templates: "Templates",
  statistiques: "Statistiques",
  stocks: "Stocks",
  contenu: "Contenu & branding",
  facturation: "Facturation",
  parametres: "Paramètres",
};

/**
 * Breadcrumbs automatiques basés sur l'URL actuelle
 */
export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Ignorer la page d'accueil du dashboard
  if (pathname === "/dashboard" || pathname === "/dashboard/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    items.push({ label, path: currentPath });
  }

  return (
    <nav className="flex items-center gap-1.5 mb-4 text-xs" aria-label="Fil d'Ariane">
      <Link
        to="/dashboard"
        className="text-muted-foreground hover:text-gold transition-colors"
      >
        📊
      </Link>
      {items.map((item, index) => (
        <span key={item.path} className="flex items-center gap-1.5">
          <span className="text-muted-foreground/30">/</span>
          {index === items.length - 1 ? (
            <span className="text-foreground font-semibold">{item.label}</span>
          ) : (
            <Link
              to={item.path}
              className="text-muted-foreground hover:text-gold transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}