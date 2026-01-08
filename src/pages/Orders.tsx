import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Package, Calendar, Star, User, Mail, DollarSign } from "lucide-react";
import { getClientId } from "@/lib/clientId";
import { toast } from "sonner";

// Interface for the list view
interface OrderSummary {
  id: number;
  productName: string;
  quantity: number;
  status: string;
  createdAt: string;
  rating: number;
  feedback: string;
  totalAmount: number;
}

// Extended interface for the Details Modal (includes Seller info)
interface OrderDetail extends OrderSummary {
  sellerName: string;
  sellerEmail: string;
}

export default function Orders() {
  const { user, getToken, API_URL } = useAuth();
  const navigate = useNavigate();

  // --- State: Data & Pagination ---
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // --- State: Order Details Modal ---
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  // --- State: Feedback Modal ---
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackOrderId, setFeedbackOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchOrders();
  }, [page, selectedYear]);

  // 1. Fetch List of Orders (Paginated)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const yearQuery = selectedYear !== "all" ? `&year=${selectedYear}` : "";
      const res = await fetch(
        `${API_URL}/order/history?page=${page}&pageSize=5${yearQuery}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            ClientId: getClientId(),
          },
        }
      );

      if (res.status === 429) {
        navigate("/too-many-requests");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(Math.ceil(data.totalCount / 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Single Order Details (For Details Modal)
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
      toast.error("Could not load order details.");
    }
  };

  // 3. Open Feedback Modal (Prevents opening Details modal)
  const handleOpenFeedback = (e: React.MouseEvent, order: OrderSummary) => {
    e.stopPropagation();
    setFeedbackOrderId(order.id);
    setRating(order.rating || 5);
    setComment(order.feedback || "");
    setIsFeedbackOpen(true);
  };

  // 4. Submit Feedback
  const submitFeedback = async () => {
    if (!feedbackOrderId) return;
    try {
      const res = await fetch(`${API_URL}/order/${feedbackOrderId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify({ rating, feedback: comment }),
      });

      if (res.ok) {
        toast.success("Feedback submitted!");
        setIsFeedbackOpen(false);
        fetchOrders(); // Refresh list to update stars in the UI
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* --- Header & Filters --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Order History</h1>

        <Select
          value={selectedYear}
          onValueChange={(val) => {
            setPage(1);
            setSelectedYear(val);
          }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- Order List --- */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className="transition-all hover:shadow-md cursor-pointer hover:border-primary/50"
              onClick={() => handleOrderClick(order.id)} // Opens Details Modal
            >
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Product Info */}
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
                    {/* Stars Display */}
                    {order.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-yellow-500">
                        {[...Array(order.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Buttons */}
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      order.status.includes("Paid") ? "default" : "secondary"
                    }>
                    {order.status}
                  </Badge>

                  {/* Rate Button - Stops Propagation to avoid opening Details */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleOpenFeedback(e, order)}>
                    {order.rating > 0 ? "Edit Review" : "Rate Product"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* --- Pagination Controls --- */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-sm font-medium">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Order Details (Seller Info, Full Amount, etc.)   */}
      {/* ========================================================= */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] top-[50%] left-[50%] !translate-x-[-50%] !translate-y-[-50%]">
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
                    {selectedOrder.totalAmount?.toFixed(2) || "N/A"}
                  </p>
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

              {/* Existing Review */}
              {selectedOrder.feedback && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-1">Your Review</h4>
                  <div className="text-sm text-muted-foreground italic">
                    "{selectedOrder.feedback}"
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 2: Feedback Form (Rating & Comment)                 */}
      {/* ========================================================= */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="top-[50%] left-[50%] !translate-x-[-50%] !translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle>Rate & Review</DialogTitle>
            <DialogDescription>
              Share your experience with this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    rating >= star
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <Textarea
              placeholder="Write your feedback here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={submitFeedback}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
