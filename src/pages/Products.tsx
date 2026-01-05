import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search, ShoppingCart, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, getToken, API_URL } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [getToken]);

  const fetchProducts = async () => {
    try {
      const token = getToken();
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/product`, { headers });
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();

      const mappedProducts = data.map((p: any) => ({
        ...p,
        image:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
        category: "General",
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({ title: "Login required", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          productId: product.id,
          product: product.name,
          quantity: 1,
        }),
      });

      if (res.ok) {
        toast({
          title: "Added to cart!",
          description: `${product.name} added.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add to cart",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Latest Products</h1>
        <p className="text-muted-foreground">Discover our collection.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <Badge className="absolute left-3 top-3">
                  {product.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{product.stock} in stock</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-primary">
                  ${product.price}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full gap-2"
                  disabled={product.stock === 0}>
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
