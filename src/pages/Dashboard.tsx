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

// Mock data
const recentOrders = [
  { id: "ORD-001", customer: "John Doe", product: "Wireless Mouse", amount: "$45.00", status: "Delivered" },
  { id: "ORD-002", customer: "Jane Smith", product: "Mechanical Keyboard", amount: "$129.00", status: "Shipped" },
  { id: "ORD-003", customer: "Bob Wilson", product: "USB-C Hub", amount: "$79.00", status: "Processing" },
  { id: "ORD-004", customer: "Alice Brown", product: "Monitor Stand", amount: "$59.00", status: "Pending" },
  { id: "ORD-005", customer: "Charlie Davis", product: "Webcam HD", amount: "$89.00", status: "Delivered" },
];

const salesData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
  { name: "Jul", value: 7000 },
];

const topProducts = [
  { id: "1", name: "Wireless Mouse Pro", sales: 234, revenue: "$10,530" },
  { id: "2", name: "Mechanical Keyboard RGB", sales: 189, revenue: "$24,381" },
  { id: "3", name: "USB-C Hub 7-in-1", sales: 156, revenue: "$12,324" },
  { id: "4", name: "4K Webcam", sales: 142, revenue: "$12,638" },
];

export default function Dashboard() {
  const { user } = useAuth();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Delivered: "default",
      Shipped: "secondary",
      Processing: "outline",
      Pending: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user?.username}
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

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value="$45,231.89"
          change="+20.1% from last month"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Orders"
          value="2,345"
          change="+15% from last month"
          changeType="positive"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Active Users"
          value="12,234"
          change="+5.2% from last month"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Products"
          value="573"
          change="23 low stock items"
          changeType="neutral"
          icon={Package}
        />
      </div>

      {/* Charts & Tables */}
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
              { header: "Sales", accessorKey: "sales", className: "text-right" },
              { header: "Revenue", accessorKey: "revenue", className: "text-right font-medium" },
            ]}
            data={topProducts}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-primary">
            View All Orders <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
        <DataTable
          columns={[
            { header: "Order ID", accessorKey: "id", className: "font-mono text-sm" },
            { header: "Customer", accessorKey: "customer" },
            { header: "Product", accessorKey: "product" },
            { header: "Amount", accessorKey: "amount", className: "text-right font-medium" },
            {
              header: "Status",
              accessorKey: (row) => getStatusBadge(row.status),
              className: "text-right",
            },
          ]}
          data={recentOrders}
        />
      </div>
    </div>
  );
}
