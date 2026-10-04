// ============================================================
// Types partagés pour l'application RestoBF
// ============================================================

// --- Commandes ---
export interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

export type OrderStatus = "new" | "in_kitchen" | "ready" | "served" | "paid" | "cancelled";

export interface Order {
  id: string;
  restaurant_id: string;
  table_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  source: string;
  notes: string | null;
  created_at: string;
  whatsapp_sent_at: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  payment_status?: "unpaid" | "pending" | "paid";
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Nouveau",
  in_kitchen: "En cuisine",
  ready: "Prêt",
  served: "Servi",
  paid: "Payé",
  cancelled: "Annulé",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  new: "border-amber-brand/40 bg-amber-tint text-amber-deep",
  in_kitchen: "border-terracotta/30 bg-terracotta-tint text-terracotta-deep",
  ready: "border-emerald/30 bg-emerald-tint text-emerald-deep",
  served: "border-charcoal/20 bg-charcoal/10 text-charcoal",
  paid: "border-emerald/40 bg-emerald/15 text-emerald-deep",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

export const ORDER_NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: "in_kitchen",
  in_kitchen: "ready",
  ready: "served",
  served: "paid",
  paid: null,
  cancelled: null,
};

// --- Stocks ---
export interface StockItem {
  id: string;
  name: string;
  category: string;
  current_quantity: number;
  min_quantity: number;
  unit: string;
  last_restock: string;
  status: "ok" | "low" | "critical";
}

// --- Staff ---
export type StaffRole = "admin" | "cuisinier" | "serveur" | "manager";

export interface StaffMember {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  pin: string | null;
  is_active: boolean;
  permissions: Record<string, any>;
  created_at: string;
}

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  admin: "Administrateur",
  cuisinier: "Cuisinier",
  serveur: "Serveur",
  manager: "Manager",
};

// --- Tables ---
export type TableStatus = "free" | "occupied" | "reserved" | "cleaning";

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  number: string;
  capacity: number;
  zone: string | null;
  status: TableStatus;
  position: number;
}

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  free: "Libre",
  occupied: "Occupée",
  reserved: "Réservée",
  cleaning: "Nettoyage",
};

// --- Chat ---
export interface ChatMessage {
  id: string;
  restaurant_id: string;
  sender_name: string;
  sender_role: StaffRole;
  message: string;
  created_at: string;
  read: boolean;
}

// --- Statistiques ---
export interface DailyStats {
  date: string;
  revenue: number;
  orders: number;
  avgTicket: number;
  fullDate: Date;
}

export interface TopItem {
  description: string;
  quantity: number;
  revenue: number;
}

export interface PeakHour {
  hour: number;
  orders: number;
}

// --- Restaurant ---
export interface Restaurant {
  id: string;
  name: string;
  slug: string | null;
  plan: string;
  template: string | null;
  city: string;
  user_id?: string;
}

// --- Utilitaires ---
export type PlanType = "free" | "premium" | "sur_mesure";

export function isPremium(plan?: string | null): boolean {
  return plan === "premium" || plan === "sur_mesure";
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR");
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);

  if (hours < 1) {
    const mins = Math.floor(diff / 60000);
    return mins <= 1 ? "À l'instant" : `Il y a ${mins} min`;
  }
  if (hours < 24) return `Il y a ${hours}h`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
