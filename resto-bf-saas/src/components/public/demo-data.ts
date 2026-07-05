import type { PublicRestaurant, PublicMenuItem, PublicReview, PublicGalleryImage, TemplateProps } from "./shared";

const restaurant: PublicRestaurant = {
  id: "demo",
  name: "Le Baobab Doré",
  city: "Ouagadougou",
  cuisine: "Cuisine burkinabè & grillades",
  description:
    "Au cœur de Ouaga, Le Baobab Doré célèbre depuis 12 ans la cuisine du terroir burkinabè : tô, riz gras, brochettes de capitaine, poulet bicyclette flambé au feu de bois. Une carte généreuse, une terrasse ombragée, l'âme du pays dans l'assiette.",
  address: "Avenue Kwame N'Krumah, secteur 4, Ouagadougou",
  hours: "Tous les jours · 11h – 23h",
  phone: "+226 70 12 34 56",
  whatsapp: "22670123456",
  email: "contact@baobab-dore.bf",
  plan: "premium",
  template: null,
};

const menu: PublicMenuItem[] = [
  { id: "m1", category: "Entrées", name: "Salade kapokier", description: "Feuilles de kapokier, oignons frais, tomates locales, vinaigrette au sésame.", price: 2500, image_url: null, available: true },
  { id: "m2", category: "Entrées", name: "Brochettes de capitaine", description: "Capitaine du Niger mariné au gingembre, grillé au feu de bois.", price: 3500, image_url: null, available: true },
  { id: "m3", category: "Entrées", name: "Beignets de mil", description: "Petits beignets dorés au mil, sauce piment maison.", price: 1500, image_url: null, available: true },
  { id: "m4", category: "Plats", name: "Tô sauce gombo", description: "Le plat emblématique burkinabè : tô de maïs blanc, sauce gombo et viande de bœuf mijotée.", price: 4500, image_url: null, available: true },
  { id: "m5", category: "Plats", name: "Poulet bicyclette flambé", description: "Poulet fermier mariné 24h, flambé au feu de bois, accompagné de riz gras parfumé.", price: 6500, image_url: null, available: true },
  { id: "m6", category: "Plats", name: "Riz gras au mouton", description: "Riz parfumé cuit dans son bouillon de mouton, légumes du marché.", price: 5500, image_url: null, available: true },
  { id: "m7", category: "Plats", name: "Brochettes mixtes royales", description: "Bœuf, mouton, poulet — assortiment grillé servi avec frites de patate douce.", price: 7000, image_url: null, available: true },
  { id: "m8", category: "Desserts", name: "Salade de fruits exotiques", description: "Mangue, papaye, ananas du Burkina, jus de bissap.", price: 2000, image_url: null, available: true },
  { id: "m9", category: "Desserts", name: "Beignets de banane miel", description: "Beignets tièdes, miel de brousse, glace vanille.", price: 2500, image_url: null, available: true },
  { id: "m10", category: "Boissons", name: "Bissap maison", description: "Infusion de fleur d'hibiscus, gingembre, citron vert.", price: 1000, image_url: null, available: true },
  { id: "m11", category: "Boissons", name: "Jus de gingembre", description: "Frais, épicé, fait maison.", price: 1000, image_url: null, available: true },
  { id: "m12", category: "Boissons", name: "Dolo artisanal", description: "Bière de mil traditionnelle, à découvrir.", price: 1500, image_url: null, available: true },
];

const reviews: PublicReview[] = [
  { id: "r1", author_name: "Awa Compaoré", rating: 5, comment: "Le meilleur tô de Ouaga, sans hésitation. Service impeccable et ambiance familiale.", created_at: new Date(Date.now() - 86400_000 * 3).toISOString() },
  { id: "r2", author_name: "Jean-Marc Sawadogo", rating: 5, comment: "Le poulet bicyclette flambé est une tuerie. J'y emmène tous mes clients.", created_at: new Date(Date.now() - 86400_000 * 9).toISOString() },
  { id: "r3", author_name: "Fatou Ouédraogo", rating: 4, comment: "Cuisine authentique, prix raisonnables. La terrasse est top en soirée.", created_at: new Date(Date.now() - 86400_000 * 15).toISOString() },
  { id: "r4", author_name: "Marc Tiendrébéogo", rating: 5, comment: "On se croirait chez grand-mère. Le riz gras au mouton vaut le détour.", created_at: new Date(Date.now() - 86400_000 * 22).toISOString() },
  { id: "r5", author_name: "Aïcha Kaboré", rating: 5, comment: "Réservation facile, accueil chaleureux, plats généreux. Je recommande à 100%.", created_at: new Date(Date.now() - 86400_000 * 30).toISOString() },
];

const gallery: PublicGalleryImage[] = [];

export const demoData: TemplateProps = { restaurant, menu, reviews, gallery };
