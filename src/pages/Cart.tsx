import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { getClientId } from "@/lib/clientId";

interface CartItem {
  productId: number;
  product: string;
  quantity: number;
  price?: number;
  image?: string;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user, getToken, API_URL } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
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
        setCart(
          data.map((i: any) => ({
            ...i,
            price: 0,
            image:
              "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop",
          }))
        );
        refreshCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify({
          productId: item.productId,
          product: item.product,
          quantity: newQuantity,
        }),
      });

      if (res.status === 429) {
        navigate("/too-many-requests");
        return;
      }

      if (res.ok) {
        setCart((prev) =>
          prev.map((c) =>
            c.productId === item.productId ? { ...c, quantity: newQuantity } : c
          )
        );
        refreshCart();
      } else {
        toast({
          title: "Update failed",
          description: "Could not update cart quantity.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
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
        setCart((prev) => prev.filter((c) => c.productId !== productId));
        toast({
          title: "Item removed",
          description: "Item removed from cart.",
        });
        refreshCart();
      } else {
        toast({
          title: "Remove failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not remove item.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${API_URL}/cart/checkout`, {
        method: "POST",
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
        toast({
          title: "Order placed!",
          description: "Redirecting to orders...",
        });
        setCart([]);
        refreshCart();
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
                  alt={item.product}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product}</h3>
                  <div className="mt-2 flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item, -1)}
                      disabled={item.quantity <= 1}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.productId)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between font-medium">
              <span>Total Items</span>
              <span>{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
          </CardContent>
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
