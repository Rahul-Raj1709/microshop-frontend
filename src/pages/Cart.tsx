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
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  MapPin,
} from "lucide-react";
import { getClientId } from "@/lib/clientId";

interface CartItem {
  productId: number;
  product: string;
  quantity: number;
  price?: number;
  image?: string;
}

interface SavedAddress {
  id: string;
  label: string;
  value: string;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(true);

  const { user, getToken, API_URL } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
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

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (res.ok) {
        const data = await res.json();

        // Extract addresses from profileData or use default shipping if no list
        const saved: SavedAddress[] = data.profileData?.savedAddresses || [];

        // If there's a default shipping address but no saved list, add it as "Default"
        if (saved.length === 0 && data.profileData?.shippingAddress) {
          saved.push({
            id: "default",
            label: "Default Shipping",
            value: data.profileData.shippingAddress,
          });
        }

        setAddresses(saved);

        // Auto-select the first one
        if (saved.length > 0) {
          setSelectedAddress(saved[0].value);
        }
      }
    } catch (err) {
      console.error("Failed to load addresses");
    } finally {
      setLoadingAddress(false);
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

      if (res.ok) {
        setCart((prev) =>
          prev.map((c) =>
            c.productId === item.productId ? { ...c, quantity: newQuantity } : c
          )
        );
        refreshCart();
      }
    } catch (err) {
      console.error(err);
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
      if (res.ok) {
        setCart((prev) => prev.filter((c) => c.productId !== productId));
        toast({ title: "Item removed" });
        refreshCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a shipping address.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Pass the selected address in the body
      const res = await fetch(`${API_URL}/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify({ shippingAddress: selectedAddress }),
      });

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
        {/* Cart Items */}
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

        {/* Checkout & Address Section */}
        <div className="space-y-6">
          {/* Address Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAddress ? (
                <p className="text-sm text-muted-foreground">
                  Loading addresses...
                </p>
              ) : addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    No saved addresses.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard/profile")}>
                    Add Address in Profile
                  </Button>
                </div>
              ) : (
                <RadioGroup
                  value={selectedAddress}
                  onValueChange={setSelectedAddress}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start space-x-2 border p-3 rounded-md">
                      <RadioGroupItem
                        value={addr.value}
                        id={addr.id}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={addr.id}
                        className="cursor-pointer grid gap-1">
                        <span className="font-semibold">{addr.label}</span>
                        <span className="text-xs text-muted-foreground leading-snug">
                          {addr.value}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Checkout Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Checkout Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between font-medium">
                <span>Total Items</span>
                <span>
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCheckout}
                disabled={!selectedAddress}>
                Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
