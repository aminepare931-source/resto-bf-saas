/**
 * Composant Skeleton pour les états de chargement
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className}`}
    />
  );
}

/**
 * Skeleton pour une carte de commande
 */
export function OrderCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-dark-card space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour une carte de stock
 */
export function StockCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-dark-card space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour une ligne de staff
 */
export function StaffCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-dark-card">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour les KPIs
 */
export function KpiCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-white/8 bg-dark-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}