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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  ShoppingCart,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  User,
  Mail,
  Store,
  Heart, // [!code ++] Added Heart icon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getClientId } from "@/lib/clientId";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query"; // [!code ++] Added useQueryClient

// --- 1. Define Random Image List ---
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
  const index = id % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[index];
};

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  description?: string;
  averageRating: number;
  reviewCount: number;
}

interface Review {
  reviewerName: string;
  rating: number;
  feedback: string;
  date: string;
}

interface ProductDetail extends Product {
  sellerName: string;
  sellerEmail: string;
  totalReviews: number;
  reviews: Review[];
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { user, getToken, API_URL } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // [!code ++]

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // --- TanStack Query: Fetch Products ---
  const {
    data: productData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["products", page, selectedCategory, debouncedSearch],
    queryFn: async () => {
      const token = getToken();
      const headers: any = {
        "Content-Type": "application/json",
        ClientId: getClientId(),
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = "";
      if (debouncedSearch.length > 0) {
        url = `${API_URL}/product/search?q=${encodeURIComponent(
          debouncedSearch,
        )}`;
      } else {
        url = `${API_URL}/product?page=${page}&pageSize=9`;
        if (selectedCategory && selectedCategory !== "all") {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
      }

      const res = await fetch(url, { headers });

      if (res.status === 429) {
        navigate("/too-many-requests");
        throw new Error("Too many requests");
      }
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      let items: Product[] = [];
      let totalPages = 1;

      if (Array.isArray(data)) {
        items = data;
      } else if (data.items) {
        items = data.items;
        totalPages = data.totalPages;
      }

      // Map images
      const mappedItems = items.map((p: any) => ({
        ...p,
        image: getProductImage(p.id, p.image),
      }));

      return { items: mappedItems, totalPages };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });

  const products = productData?.items || [];
  const totalPages = productData?.totalPages || 1;

  // --- [!code ++] TanStack Query: Fetch Wishlist IDs ---
  // This helps us know which heart icons should be filled
  const { data: wishlistIds } = useQuery({
    queryKey: ["wishlist-ids", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      // We only need the IDs to check inclusion
      return data.map((item: any) => item.id) as number[];
    },
    enabled: !!user, // Only run if logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // --- [!code ++] Toggle Wishlist Handler ---
  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation(); // Prevent opening the details modal

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    const isLiked = wishlistIds?.includes(productId);

    // Optimistic Update (optional, but good for UX) or simpler: Invalidate
    const method = isLiked ? "DELETE" : "POST";
    const url = isLiked
      ? `${API_URL}/wishlist/${productId}`
      : `${API_URL}/wishlist`;
    const body = isLiked ? undefined : JSON.stringify({ productId });

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body,
      });

      if (res.ok) {
        // Refresh the wishlist IDs so the UI updates
        queryClient.invalidateQueries({ queryKey: ["wishlist-ids"] });

        toast({
          title: isLiked ? "Removed" : "Saved",
          description: isLiked ? "Removed from wishlist" : "Added to wishlist",
        });
      } else {
        throw new Error("Action failed");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update wishlist.",
        variant: "destructive",
      });
    }
  };

  // --- Fetch Full Details (On demand) ---
  const handleProductClick = async (productId: number) => {
    try {
      const res = await fetch(`${API_URL}/product/${productId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const mappedData = {
          ...data,
          image: getProductImage(data.id, data.image),
        };
        setSelectedProduct(mappedData);
        setIsDetailsOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Could not fetch details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch product details", error);
    }
  };

  const addToCart = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();

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
          ClientId: getClientId(),
        },
        body: JSON.stringify({
          productId: product.id,
          product: product.name,
          quantity: 1,
        }),
      });

      if (res.status === 429) {
        navigate("/too-many-requests");
        return;
      }

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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Latest Products</h1>
        <p className="text-muted-foreground">
          Search via Elasticsearch or filter by Category.
        </p>
      </div>

      {/* --- Search & Filter --- */}
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

      {/* --- Product Grid --- */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <>
          <div className="min-h-[400px]">
            {/* Opacity indicates stale/background fetching during pagination */}
            <div
              className={`transition-opacity duration-200 ${
                isFetching ? "opacity-70" : "opacity-100"
              }`}>
              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No products found.
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-lg flex flex-col cursor-pointer transition-all hover:border-primary/50"
                      onClick={() => handleProductClick(product.id)}>
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

                        {/* [!code ++] Heart Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-2 top-2 h-8 w-8 bg-background/80 hover:bg-background/100 rounded-full shadow-sm z-10 "
                          onClick={(e) => toggleWishlist(e, product.id)}>
                          <Heart
                            className={`h-5 w-5 transition-colors ${
                              wishlistIds?.includes(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500"
                            }`}
                          />
                        </Button>
                      </div>
                      <CardContent className="p-4 flex-1">
                        <h3 className="text-lg font-semibold line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 h-8">
                          {product.description || "No description available."}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Package className="h-4 w-4" />
                          <span>{product.stock} in stock</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {product.reviewCount > 0 ? (
                            <>
                              <div className="flex items-center text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                              </div>
                              <span className="text-sm font-medium">
                                {product.averageRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({product.reviewCount})
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No reviews yet
                            </span>
                          )}
                        </div>

                        <p className="text-2xl font-bold text-primary">
                          ${product.price}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          onClick={(e) => addToCart(e, product)}
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
          </div>

          {/* --- Pagination --- */}
          {debouncedSearch === "" && products.length > 0 && (
            <div className="flex justify-center items-center gap-4 py-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* MODAL: Product Details (Unchanged from original logic)    */}
      {/* ========================================================= */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 top-[50%] left-[50%] !translate-x-[-50%] !translate-y-[-50%]">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">
              {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>Product Details & Reviews</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {selectedProduct && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full sm:w-1/3 rounded-lg object-cover aspect-square bg-muted"
                  />
                  <div className="space-y-3 flex-1">
                    <Badge variant="secondary">
                      {selectedProduct.category}
                    </Badge>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" /> {selectedProduct.stock}{" "}
                        Stock
                      </span>
                      {selectedProduct.totalReviews > 0 && (
                        <span className="flex items-center gap-1 text-yellow-600 font-medium">
                          <Star className="h-4 w-4 fill-current" />
                          {selectedProduct.averageRating} (
                          {selectedProduct.totalReviews} Reviews)
                        </span>
                      )}
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
                      <div className="font-semibold flex items-center gap-2">
                        <Store className="h-4 w-4" /> Seller Information
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {selectedProduct.sellerName || "Unknown Seller"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {selectedProduct.sellerEmail || "No contact info"}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedProduct.description ||
                      "No description provided for this product."}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    Customer Reviews
                    <Badge variant="outline" className="ml-2">
                      {selectedProduct.totalReviews}
                    </Badge>
                  </h3>

                  {selectedProduct.reviews &&
                  selectedProduct.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {selectedProduct.reviews.map((review, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/30 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {review.reviewerName || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm italic text-muted-foreground">
                            "{review.feedback}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No reviews yet. Be the first to buy and review!
                    </p>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-background">
            {selectedProduct && (
              <div className="flex w-full items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  ${selectedProduct.price}
                </div>
                <Button
                  onClick={(e) => addToCart(e, selectedProduct)}
                  disabled={selectedProduct.stock === 0}
                  className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {selectedProduct.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
