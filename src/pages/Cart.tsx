import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

interface CartItem {
  productId: number;
  product: string;
  quantity: number;
  price?: number; // Backend CartItem doesn't store price, so we might treat it as 0 or fetch it
  image?: string;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user, getToken, API_URL } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Add placeholder data for display
        setCart(
          data.map((i: any) => ({
            ...i,
            price: 0, // Backend Redis cart didn't store price, ideally update CartAPI to store it
            image:
              "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop",
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${API_URL}/cart/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.ok) {
        toast({
          title: "Order placed!",
          description: "Redirecting to orders...",
        });
        setCart([]);
        setTimeout(() => navigate("/orders"), 1500);
      } else {
        toast({
          title: "Checkout Failed",
          description: "Try again later",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Checkout failed",
        variant: "destructive",
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button className="mt-6" onClick={() => navigate("/")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex items-center gap-4 p-4">
                <img
                  src={item.image}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product}</h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
              Checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
