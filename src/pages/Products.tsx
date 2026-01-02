import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search, ShoppingCart, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

const products: Product[] = [
  { id: "1", name: "Wireless Mouse Pro", price: 45, stock: 234, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop", category: "Accessories" },
  { id: "2", name: "Mechanical Keyboard RGB", price: 129, stock: 89, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=300&fit=crop", category: "Accessories" },
  { id: "3", name: "USB-C Hub 7-in-1", price: 79, stock: 156, image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=300&fit=crop", category: "Electronics" },
  { id: "4", name: "4K Webcam HD", price: 89, stock: 45, image: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=300&fit=crop", category: "Electronics" },
  { id: "5", name: "Monitor Stand Deluxe", price: 59, stock: 12, image: "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=400&h=300&fit=crop", category: "Furniture" },
  { id: "6", name: "Desk Lamp LED", price: 39, stock: 78, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop", category: "Lighting" },
];

export default function Products() {
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Latest Products</h1>
        <p className="text-muted-foreground">Discover our collection of premium tech accessories.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className="absolute left-3 top-3">{product.category}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{product.stock} in stock</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-primary">${product.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                onClick={() => addToCart(product)}
                className="w-full gap-2"
                disabled={!user || product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}
