import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { toast } from "sonner";
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Award,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/statistiques")({
  component: StatisticsPage,
});

interface DailyStats {
  date: string;
  revenue: number;
  orders: number;
  avgTicket: number;
  fullDate: Date;
}

interface TopItem {
  description: string;
  quantity: number;
  revenue: number;
}

interface PeakHour {
  hour: number;
  orders: number;
}

interface WeeklyComparison {
  day: string;
  thisWeek: number;
  lastWeek: number;
}

const CHART_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899"];

function StatisticsPage() {
  const { restaurant: r, loading: loadingResto } = useMyRestaurant();
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  const [stats, setStats] = useState<{
    today: number;
    week: number;
    month: number;
    year: number;
    yesterday: number;
    lastWeek: number;
  }>({ today: 0, week: 0, month: 0, year: 0, yesterday: 0, lastWeek: 0 });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"revenue" | "orders" | "comparison">("revenue");

  useEffect(() => {
    if (r) {
      loadStatistics();
    }
  }, [r?.id, period]);

  const loadStatistics = async () => {
    if (!r) return;

    try {
      setLoading(true);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

      // Basé sur les commandes réelles (servies ou payées), disponibles pour
      // TOUS les plans — les factures restent optionnelles/premium et ne
      // reflètent pas forcément toutes les ventes.
      const { data: rawOrders, error } = await supabase
        .from("orders" as never)
        .select("*")
        .eq("restaurant_id", r.id)
        .in("status", ["served", "paid"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      type OrderRow = { created_at: string; total: number; items: { name: string; qty: number; price: number }[] };
      const invoices = ((rawOrders ?? []) as unknown as OrderRow[]).map((o) => ({
        issued_at: o.created_at,
        total: Number(o.total) || 0,
        items: (o.items ?? []).map((it) => ({
          description: it.name,
          quantity: it.qty,
          unit_price: it.price,
        })),
      }));

      const todayRevenue = invoices
        .filter((inv) => new Date(inv.issued_at) >= today)
        .reduce((sum, inv) => sum + inv.total, 0);

      const yesterdayRevenue = invoices
        .filter((inv) => {
          const d = new Date(inv.issued_at);
          return d >= yesterday && d < today;
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      const weekRevenue = invoices
        .filter((inv) => new Date(inv.issued_at) >= weekAgo)
        .reduce((sum, inv) => sum + inv.total, 0);

      const lastWeekRevenue = invoices
        .filter((inv) => {
          const d = new Date(inv.issued_at);
          return d >= twoWeeksAgo && d < weekAgo;
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      const monthRevenue = invoices
        .filter((inv) => new Date(inv.issued_at) >= monthAgo)
        .reduce((sum, inv) => sum + inv.total, 0);

      const yearRevenue = invoices
        .filter((inv) => new Date(inv.issued_at) >= yearAgo)
        .reduce((sum, inv) => sum + inv.total, 0);

      setStats({
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        week: weekRevenue,
        lastWeek: lastWeekRevenue,
        month: monthRevenue,
        year: yearRevenue,
      });

      // Daily stats for chart
      const daysToShow = period === "week" ? 7 : period === "month" ? 30 : 365;
      const startDate = new Date(today.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000);
      const dailyData: DailyStats[] = [];

      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const dayInvoices = invoices.filter((inv) => {
          const invDate = new Date(inv.issued_at);
          return invDate >= dayStart && invDate < dayEnd;
        });

        const revenue = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);

        dailyData.push({
          date: date.toLocaleDateString("fr-FR", {
            weekday: period === "week" ? "short" : undefined,
            day: "numeric",
            month: period === "year" ? "short" : undefined,
          }),
          revenue,
          orders: dayInvoices.length,
          avgTicket: dayInvoices.length > 0 ? revenue / dayInvoices.length : 0,
          fullDate: date,
        });
      }
      setDailyStats(dailyData);

      // Weekly comparison
      const comparison: WeeklyComparison[] = [];
      for (let i = 6; i >= 0; i--) {
        const thisDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const thisDayStart = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate());
        const thisDayEnd = new Date(thisDayStart.getTime() + 24 * 60 * 60 * 1000);

        const lastDate = new Date(thisDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastDayStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const lastDayEnd = new Date(lastDayStart.getTime() + 24 * 60 * 60 * 1000);

        const thisRevenue = invoices
          .filter((inv) => {
            const d = new Date(inv.issued_at);
            return d >= thisDayStart && d < thisDayEnd;
          })
          .reduce((sum, inv) => sum + inv.total, 0);

        const lastRevenue = invoices
          .filter((inv) => {
            const d = new Date(inv.issued_at);
            return d >= lastDayStart && d < lastDayEnd;
          })
          .reduce((sum, inv) => sum + inv.total, 0);

        comparison.push({
          day: thisDate.toLocaleDateString("fr-FR", { weekday: "short" }),
          thisWeek: thisRevenue,
          lastWeek: lastRevenue,
        });
      }
      setWeeklyComparison(comparison);

      // Top items
      const itemMap = new Map<string, { quantity: number; revenue: number }>();
      invoices.forEach((inv) => {
        const items = inv.items as any[];
        items.forEach((item) => {
          const existing = itemMap.get(item.description) || { quantity: 0, revenue: 0 };
          itemMap.set(item.description, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.quantity * item.unit_price,
          });
        });
      });

      const topItemsList = Array.from(itemMap.entries())
        .map(([description, data]) => ({
          description,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopItems(topItemsList);

      // Peak hours
      const hourMap = new Map<number, number>();
      invoices.forEach((inv) => {
        const hour = new Date(inv.issued_at).getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      });

      const peakHoursList = Array.from(hourMap.entries())
        .map(([hour, orders]) => ({ hour, orders }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      setPeakHours(peakHoursList);
    } catch (error) {
      console.error("Error loading statistics:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `${value.toLocaleString("fr-FR")} F`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loadingResto) return <p className="text-muted-foreground">Chargement...</p>;

  const todayChange = stats.yesterday > 0
    ? ((stats.today - stats.yesterday) / stats.yesterday) * 100
    : 0;
  const weekChange = stats.lastWeek > 0
    ? ((stats.week - stats.lastWeek) / stats.lastWeek) * 100
    : 0;

  const maxDailyRevenue = Math.max(...dailyStats.map((d) => d.revenue), 1);

  // Prepare data for pie chart
  const topItemsPieData = topItems.map((item, i) => ({
    name: item.description,
    value: item.revenue,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Peak hours for bar chart
  const peakHoursData = Array.from({ length: 24 }, (_, hour) => {
    const peak = peakHours.find((p) => p.hour === hour);
    return {
      hour: `${hour}h`,
      commandes: peak?.orders || 0,
    };
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Analytics</p>
        <h1 className="text-3xl font-black">Statistiques</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-gold" />
                <span className="text-xs text-muted-foreground">Aujourd'hui</span>
              </div>
              <p className="text-2xl font-black">{stats.today.toLocaleString("fr-FR")} F</p>
              {todayChange !== 0 && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${todayChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {todayChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(todayChange).toFixed(1)}% vs hier
                </p>
              )}
            </div>

            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-muted-foreground">Cette semaine</span>
              </div>
              <p className="text-2xl font-black">{stats.week.toLocaleString("fr-FR")} F</p>
              {weekChange !== 0 && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${weekChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {weekChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(weekChange).toFixed(1)}% vs semaine dernière
                </p>
              )}
            </div>

            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <div className="flex items-center justify-between mb-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-muted-foreground">Ce mois</span>
              </div>
              <p className="text-2xl font-black">{stats.month.toLocaleString("fr-FR")} F</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-muted-foreground">Cette année</span>
              </div>
              <p className="text-2xl font-black">{stats.year.toLocaleString("fr-FR")} F</p>
            </div>
          </div>

          {/* Période selector et tabs graphiques */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeChart === "revenue" ? "bg-gold text-[#0a0a0f]" : "bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                Revenus
              </button>
              <button
                onClick={() => setActiveChart("orders")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeChart === "orders" ? "bg-gold text-[#0a0a0f]" : "bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                Commandes
              </button>
              <button
                onClick={() => setActiveChart("comparison")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeChart === "comparison" ? "bg-gold text-[#0a0a0f]" : "bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                Comparaison
              </button>
            </div>

            <div className="flex gap-2">
              {(["week", "month", "year"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    period === p ? "bg-white/10 text-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p === "week" ? "7 jours" : p === "month" ? "30 jours" : "1 an"}
                </button>
              ))}
            </div>
          </div>

          {/* Graphique principal */}
          <div className="p-6 rounded-2xl border border-white/8 bg-dark-card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gold" />
                {activeChart === "revenue" && "Évolution des revenus"}
                {activeChart === "orders" && "Nombre de commandes"}
                {activeChart === "comparison" && "Comparaison semaine"}
              </h3>
            </div>

            {activeChart === "revenue" && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                      interval={period === "year" ? 30 : period === "month" ? 5 : 0}
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                      name="Revenus"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeChart === "orders" && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                      interval={period === "year" ? 30 : period === "month" ? 5 : 0}
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                      labelStyle={{ color: "#888" }}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Commandes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeChart === "comparison" && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="thisWeek" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Cette semaine" />
                    <Bar dataKey="lastWeek" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Semaine dernière" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Graphiques secondaires */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Top items avec graphique */}
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-gold" />
                Top 5 des articles
              </h3>
              {topItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              ) : (
                <div className="space-y-4">
                  {/* Pie chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={topItemsPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {topItemsPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Liste */}
                  <div className="space-y-2">
                    {topItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: `${CHART_COLORS[i]}20`, color: CHART_COLORS[i] }}
                          >
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{item.description}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} vendus</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gold flex-shrink-0 ml-2">
                          {item.revenue.toLocaleString("fr-FR")} F
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Heures de pointe avec bar chart */}
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                Heures de pointe
              </h3>
              {peakHours.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              ) : (
                <div className="space-y-4">
                  {/* Bar chart des heures */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="hour"
                          tick={{ fill: "#888", fontSize: 10 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                          tickLine={false}
                          interval={2}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                          labelStyle={{ color: "#888" }}
                        />
                        <Bar dataKey="commandes" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Commandes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top 5 heures */}
                  <div className="space-y-2">
                    {peakHours.map((peak, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-sm">
                            {peak.hour}h
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {peak.hour}h - {peak.hour + 1}h
                            </p>
                            <p className="text-xs text-muted-foreground">{peak.orders} commandes</p>
                          </div>
                        </div>
                        {i === 0 && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Carte jour de la semaine */}
          {dailyStats.length >= 7 && (
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gold" />
                Revenus des 7 derniers jours
              </h3>
              <div className="space-y-3">
                {dailyStats.slice(-7).map((day, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-muted-foreground">{day.date}</div>
                    <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-gold rounded-lg transition-all duration-500"
                        style={{ width: `${(day.revenue / maxDailyRevenue) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-semibold">
                          {day.revenue.toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-right text-xs text-muted-foreground">
                      {day.orders} cmd
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carte des tickets moyens */}
          {dailyStats.length > 0 && (
            <div className="p-6 rounded-2xl border border-white/8 bg-dark-card mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gold" />
                Ticket moyen par jour
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: "#888" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTicket"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 3 }}
                      name="Ticket moyen"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 rounded-xl border border-gold/30 bg-gold/5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gold">Conseil d'optimisation</p>
              <p className="text-xs text-muted-foreground mt-1">
                {peakHours.length > 0 && topItems.length > 0 ? (
                  <>
                    Votre heure de pointe est à {peakHours[0].hour}h avec {peakHours[0].orders}{" "}
                    commandes. Assurez-vous d'avoir suffisamment de personnel et de stock pour
                    votre article le plus populaire :{" "}
                    <strong>{topItems[0].description}</strong>.
                  </>
                ) : (
                  "Commencez à créer des factures pour voir vos statistiques apparaître ici."
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}