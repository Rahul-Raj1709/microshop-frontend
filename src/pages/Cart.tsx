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
  Loader2,
} from "lucide-react";
import { getClientId } from "@/lib/clientId";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const { user, getToken, API_URL } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user) return <Navigate to="/login" replace />;

  // --- 1. Fetch Cart ---
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      return data.map((i: any) => ({
        ...i,
        price: 0,
        image:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop",
      })) as CartItem[];
    },
  });

  // --- 2. Fetch Addresses ---
  const addressQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      const saved: SavedAddress[] = data.profileData?.savedAddresses || [];

      if (saved.length === 0 && data.profileData?.shippingAddress) {
        saved.push({
          id: "default",
          label: "Default Shipping",
          value: data.profileData.shippingAddress,
        });
      }
      return saved;
    },
  });

  // Auto-select first address when loaded
  useEffect(() => {
    if (addressQuery.data && addressQuery.data.length > 0 && !selectedAddress) {
      setSelectedAddress(addressQuery.data[0].value);
    }
  }, [addressQuery.data]);

  // --- 3. Mutations ---
  const updateQtyMutation = useMutation({
    mutationFn: async ({ item, delta }: { item: CartItem; delta: number }) => {
      const newQuantity = item.quantity + delta;
      if (newQuantity < 1) return;
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
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      refreshCart(); // Update global cart count in navbar
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      refreshCart();
      toast({ title: "Item removed" });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddress) throw new Error("No address selected");
      const res = await fetch(`${API_URL}/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify({ shippingAddress: selectedAddress }),
      });
      if (!res.ok) throw new Error("Checkout failed");
    },
    onSuccess: () => {
      toast({
        title: "Order placed!",
        description: "Redirecting to orders...",
      });
      queryClient.setQueryData(["cart"], []); // Clear cart instantly in UI
      refreshCart();
      setTimeout(() => navigate("/orders"), 1500);
    },
    onError: () => {
      toast({
        title: "Checkout Failed",
        description: "Try again later",
        variant: "destructive",
      });
    },
  });

  if (cartQuery.isLoading)
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  const cart = cartQuery.data || [];

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
                      onClick={() =>
                        updateQtyMutation.mutate({ item, delta: -1 })
                      }
                      disabled={
                        item.quantity <= 1 || updateQtyMutation.isPending
                      }>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQtyMutation.mutate({ item, delta: 1 })
                      }
                      disabled={updateQtyMutation.isPending}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeMutation.mutate(item.productId)}
                  disabled={removeMutation.isPending}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout & Address Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addressQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading addresses...
                </p>
              ) : (addressQuery.data || []).length === 0 ? (
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
                  {addressQuery.data?.map((addr) => (
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
                onClick={() => checkoutMutation.mutate()}
                disabled={!selectedAddress || checkoutMutation.isPending}>
                {checkoutMutation.isPending ? "Processing..." : "Checkout"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
