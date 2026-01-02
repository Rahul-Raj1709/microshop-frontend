import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Calendar, CheckCircle, Truck, Clock, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  productName: string;
  quantity: number;
  status: "Delivered" | "Shipped" | "Processing" | "Pending";
  createdAt: string;
  total: number;
}

const orders: Order[] = [
  { id: "ORD-001", productName: "Wireless Mouse Pro", quantity: 2, status: "Delivered", createdAt: "2024-01-15", total: 90 },
  { id: "ORD-002", productName: "Mechanical Keyboard RGB", quantity: 1, status: "Shipped", createdAt: "2024-01-18", total: 129 },
  { id: "ORD-003", productName: "USB-C Hub 7-in-1", quantity: 1, status: "Processing", createdAt: "2024-01-20", total: 79 },
  { id: "ORD-004", productName: "4K Webcam HD", quantity: 1, status: "Pending", createdAt: "2024-01-22", total: 89 },
];

const statusConfig = {
  Delivered: { color: "default" as const, icon: CheckCircle, label: "Delivered" },
  Shipped: { color: "secondary" as const, icon: Truck, label: "Shipped" },
  Processing: { color: "outline" as const, icon: Clock, label: "Processing" },
  Pending: { color: "destructive" as const, icon: AlertCircle, label: "Pending" },
};

export default function Orders() {
  const { user } = useAuth();

  // Redirect if not logged in or is manager
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "SuperAdmin" || user.role === "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <Package className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No orders yet</h2>
        <p className="mt-2 text-muted-foreground">Start shopping to see your orders here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Order History</h1>
        <p className="mt-1 text-muted-foreground">Track and manage your orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;

          return (
            <Card key={order.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{order.productName}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="font-mono">{order.id}</span>
                      <span>Qty: {order.quantity}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                  <Badge variant={config.color} className="gap-1.5">
                    <StatusIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
