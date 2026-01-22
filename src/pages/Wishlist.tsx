import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getClientId } from "@/lib/clientId";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Trash2, HeartOff, Package, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Helper for consistent images (same as Products.tsx)
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=400&fit=crop",
];

const getProductImage = (id: number, existingImage?: string) => {
  if (existingImage) return existingImage;
  return PLACEHOLDER_IMAGES[id % PLACEHOLDER_IMAGES.length];
};

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  averageRating: number;
  reviewCount: number;
  addedOn: string;
}

export default function Wishlist() {
  const { getToken, API_URL } = useAuth();
  const { refreshCart } = useCart();
  const queryClient = useQueryClient();

  // 1. Fetch Wishlist
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      
      // Map images
      return data.map((item: any) => ({
        ...item,
        image: getProductImage(item.id, item.image),
      })) as WishlistItem[];
    },
  });

  // 2. Remove Mutation
  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to remove");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({ description: "Removed from wishlist" });
    },
  });

  // 3. Add to Cart Handler
  const addToCart = async (item: WishlistItem) => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify({
            productId: item.id,
            product: item.name,
            quantity: 1,
        }),
      });
      if (res.ok) {
        refreshCart();
        toast({ title: "Added to cart", description: `${item.name} added.` });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <Badge variant="secondary" className="text-sm">
          {wishlist?.length || 0} Items
        </Badge>
      </div>

      {wishlist?.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
            <HeartOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">Save items you want to buy later!</p>
            <Button asChild>
                <Link to="/">Browse Products</Link>
            </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist?.map((product) => (
            <Card key={product.id} className="group overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.category && (
                  <Badge className="absolute left-3 top-3">{product.category}</Badge>
                )}
                <Button
                    size="icon"
                    variant="destructive"
                    className="absolute right-3 top-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMutation.mutate(product.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4 flex-1">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Package className="h-4 w-4" />
                    <span>{product.stock} in stock</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-xl font-bold text-primary">${product.price}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                    className="w-full gap-2" 
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock === 0 ? "Out of Stock" : "Move to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}