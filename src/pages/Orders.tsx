import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Package, Calendar, User, Mail, DollarSign } from "lucide-react";
import { getClientId } from "@/lib/clientId";

interface Order {
  id: number;
  productName: string;
  quantity: number;
  status: string;
  createdAt: string;
}

// Extended interface for full details
interface OrderDetail extends Order {
  totalAmount: number;
  sellerName: string;
  sellerEmail: string;
}

export default function Orders() {
  const { user, getToken, API_URL } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/order/history`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });

      if (res.status === 429) {
        navigate("/too-many-requests");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderClick = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch order details", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Order History</h1>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="transition-all hover:shadow-md cursor-pointer hover:border-primary/50"
            onClick={() => handleOrderClick(order.id)}>
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

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Full information about your purchase.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-6 py-4">
              {/* Product Info */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedOrder.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {selectedOrder.quantity}
                  </p>
                  <p className="text-sm font-medium mt-1 flex items-center gap-1">
                    Total: <DollarSign className="h-3 w-3" />
                    {selectedOrder.totalAmount || "N/A"}
                  </p>
                </div>
              </div>

              {/* Status & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status
                  </span>
                  <div>
                    <Badge
                      variant={
                        selectedOrder.status.includes("Paid")
                          ? "default"
                          : "secondary"
                      }>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Order Date
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Seller Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">
                  Seller Information
                </h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.sellerName || "Unknown Seller"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedOrder.sellerEmail || "No contact info"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
