import { useAuth } from "@/context/AuthContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { getClientId } from "@/lib/clientId";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface TopProductAPI {
  name: string;
  sales: number;
  revenue: number;
}
interface RecentOrder {
  id: number;
  customer: string;
  product: string;
  amount: number;
  status: string;
}
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  topProducts: TopProductAPI[];
  recentOrders: RecentOrder[];
}
interface TopProductRow extends TopProductAPI {
  id: string | number;
}
const salesData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
  { name: "Jul", value: 7000 },
];

export default function Dashboard() {
  const { user, getToken, API_URL } = useAuth();
  const navigate = useNavigate();

  // --- TanStack Query Fetcher ---
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", user?.id], // Cache key unique to this user
    queryFn: async () => {
      const token = getToken();
      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ClientId: getClientId(),
        },
      });

      if (response.status === 429) {
        navigate("/too-many-requests");
        throw new Error("Too many requests");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      return response.json() as Promise<DashboardStats>;
    },
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      "Paid & Completed": "default",
      Delivered: "default",
      Shipped: "secondary",
      Processing: "outline",
      Pending: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const tableTopProducts: TopProductRow[] =
    stats?.topProducts.map((p, i) => ({
      ...p,
      id: i,
    })) || [];

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-destructive">Failed to load dashboard data.</div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your store today.
          </p>
        </div>
        <Button className="gap-2">
          <TrendingUp className="h-4 w-4" />
          View Reports
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          change="Lifetime"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Orders"
          value={stats?.totalOrders.toString() || "0"}
          change="Total orders processed"
          changeType="positive"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Products"
          value={stats?.totalProducts.toString() || "0"}
          change="Available in catalog"
          changeType="neutral"
          icon={Package}
        />
        <MetricCard
          title="Active Users"
          value="--"
          change="Analytics pending"
          changeType="neutral"
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue Overview" data={salesData} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              View All <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
          <DataTable
            columns={[
              { header: "Product", accessorKey: "name" },
              {
                header: "Sales",
                accessorKey: "sales",
                className: "text-right",
              },
              {
                header: "Revenue",
                accessorKey: (row: TopProductRow) =>
                  formatCurrency(row.revenue),
                className: "text-right font-medium",
              },
            ]}
            data={tableTopProducts}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All Orders <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
        <DataTable
          columns={[
            {
              header: "Order ID",
              accessorKey: "id",
              className: "font-mono text-sm",
            },
            { header: "Customer ID", accessorKey: "customer" },
            { header: "Product", accessorKey: "product" },
            {
              header: "Amount",
              accessorKey: (row: RecentOrder) => formatCurrency(row.amount),
              className: "text-right font-medium",
            },
            {
              header: "Status",
              accessorKey: (row: RecentOrder) => getStatusBadge(row.status),
              className: "text-right",
            },
          ]}
          data={stats?.recentOrders || []}
        />
      </div>
    </div>
  );
}
