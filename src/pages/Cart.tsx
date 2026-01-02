import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const initialCart: CartItem[] = [
  { id: "1", name: "Wireless Mouse Pro", price: 45, quantity: 2, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop" },
  { id: "2", name: "Mechanical Keyboard RGB", price: 129, quantity: 1, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop" },
];

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or is manager
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "SuperAdmin" || user.role === "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
    toast({ title: "Item removed", description: "Item has been removed from your cart." });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    toast({
      title: "Order placed!",
      description: "Your order has been successfully placed. Redirecting to orders...",
    });
    setCart([]);
    setTimeout(() => navigate("/orders"), 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
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
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-lg font-bold text-primary">${item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="w-20 text-right font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-success">Free</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Add ${(100 - subtotal).toFixed(2)} more for free shipping!
              </p>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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
