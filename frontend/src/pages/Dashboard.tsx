import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Package,
  ArrowDownToLine,
  RotateCcw,
  Receipt,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { formatSafe } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Generate mock chart data for last 30 days
const generateChartData = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "d MMM"),
      sales: Math.floor(Math.random() * 120000) + 5000,
    });
  }
  return data;
};

const chartData = generateChartData();

const Dashboard = () => {
  const { products, sales, currencySymbol } = useShop();
  const navigate = useNavigate();

  const todaySales = sales.filter(
    (s) => new Date(s.timestamp).toDateString() === new Date().toDateString()
  );
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
  const lowStock = products.filter((p) => p.stock_quantity < 10);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);

  const topStats = [
    {
      label: "Total Purchase",
      value: `${currencySymbol}0.00`,
      icon: ArrowDownToLine,
      gradient: "pos-gradient-primary",
    },
    {
      label: "Purchase Due",
      value: `${currencySymbol}0.00`,
      icon: AlertTriangle,
      gradient: "pos-gradient-warning",
    },
    {
      label: "Total Purchase Return",
      value: `${currencySymbol}0.00`,
      icon: RotateCcw,
      gradient: "pos-gradient-danger",
    },
    {
      label: "Expense",
      value: `${currencySymbol}0.00`,
      icon: Receipt,
      gradient: "pos-gradient-accent",
    },
  ];

  const salesStats = [
    {
      label: "Today's Sales",
      value: `${currencySymbol}${todayTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: "pos-gradient-primary",
      change: `${todaySales.length} transactions`,
    },
    {
      label: "Total Products",
      value: products.length.toString(),
      icon: Package,
      gradient: "pos-gradient-accent",
      change: `${products.reduce((s, p) => s + p.stock_quantity, 0)} units in stock`,
    },
    {
      label: "Low Stock Alerts",
      value: lowStock.length.toString(),
      icon: AlertTriangle,
      gradient: "pos-gradient-warning",
      change: "Items below 10 units",
    },
    {
      label: "Total Revenue",
      value: `${currencySymbol}${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: "pos-gradient-primary",
      change: `${sales.length} total sales`,
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here's what's happening today.
        </p>
      </div>

      {/* Purchase Stats Row (like screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((stat) => (
          <div key={stat.label} className="pos-stat-card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground font-mono">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Last 30 Days Chart */}
      <div className="pos-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Sales Last 30 Days</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={60}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                tickFormatter={(v) => `${formatSafe(v / 1000, 0)}k`}
                label={{
                  value: `Total Sales (${currencySymbol})`,
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, "Sales"]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesStats.map((stat) => (
          <div key={stat.label} className="pos-stat-card group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 pos-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Sales</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest transactions</p>
            </div>
            <button
              onClick={() => navigate("/sales")}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sale #{sale.id}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(sale.timestamp), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{currencySymbol}{formatSafe(sale.total_amount)}</p>
                  <p className="text-xs text-muted-foreground">Tax: {currencySymbol}{formatSafe(sale.tax_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock + Quick Actions */}
        <div className="space-y-6">
          <div className="pos-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Sale", icon: ShoppingBag, action: () => navigate("/pos") },
                { label: "Add Product", icon: Package, action: () => navigate("/inventory") },
                { label: "View Sales", icon: TrendingUp, action: () => navigate("/sales") },
                { label: "Expenses", icon: Receipt, action: () => navigate("/expenses") },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors border border-border"
                >
                  <a.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pos-card">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Low Stock Alerts</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Below 10 units</p>
            </div>
            <div className="divide-y divide-border">
              {lowStock.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">All items are well stocked!</p>
              ) : (
                lowStock.map((p) => (
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category_name}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.stock_quantity <= 3
                        ? "bg-destructive/10 text-destructive stock-pulse"
                        : "bg-pos-warning/10 text-pos-warning"
                    }`}>
                      {p.stock_quantity} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
