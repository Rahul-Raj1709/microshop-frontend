import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  ShoppingCart,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getClientId } from "@/lib/clientId"; // [!code ++]

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  description?: string;
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const { user, getToken, API_URL } = useAuth();
  const { refreshCart } = useCart();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [getToken, page, selectedCategory, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getToken();
      // [!code ++] Added ClientId
      const headers: any = {
        "Content-Type": "application/json",
        ClientId: getClientId(),
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = "";

      if (debouncedSearch.length > 0) {
        url = `${API_URL}/product/search?q=${encodeURIComponent(
          debouncedSearch
        )}`;
      } else {
        url = `${API_URL}/product?page=${page}&pageSize=9`;
        if (selectedCategory && selectedCategory !== "all") {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      let items: Product[] = [];

      if (Array.isArray(data)) {
        items = data;
        setTotalPages(1);
      } else if (data.items) {
        items = data.items;
        setTotalPages(data.totalPages);
      }

      const mappedProducts = items.map((p: any) => ({
        ...p,
        image:
          p.image ||
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error(error);
      toast({ title: "Error loading products", variant: "destructive" });
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
          ClientId: getClientId(), // [!code ++] Added ClientId
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
        refreshCart();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ... UI Remains Exactly the Same ... */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Latest Products</h1>
        <p className="text-muted-foreground">
          Search via Elasticsearch or filter by Category.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setPage(1);
              setSelectedCategory(val);
            }}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products found.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden hover:shadow-lg flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    {product.category && (
                      <Badge className="absolute left-3 top-3">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 flex-1">
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2 h-8">
                      {product.description || ""}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

          {debouncedSearch === "" && products.length > 0 && (
            <div className="flex justify-center items-center gap-4 py-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
