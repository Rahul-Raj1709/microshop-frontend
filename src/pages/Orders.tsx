import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Calendar,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Order {
  id: number;
  productName: string;
  quantity: number;
  status: string;
  createdAt: string;
}

export default function Orders() {
  const { user, getToken, API_URL } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/order/history`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Order History</h1>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="transition-all hover:shadow-md">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{order.productName}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground">
                    <span>Qty: {order.quantity}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    order.status.includes("Paid") ? "default" : "secondary"
                  }>
                  {order.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
