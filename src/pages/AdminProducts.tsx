import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    category: "General",
  });

  const { getToken, API_URL } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/product`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      // Add placeholder category
      const mapped = data.map((p: any) => ({ ...p, category: "General" }));
      setProducts(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        // BACKEND LIMITATION: Only Stock Update is supported via API for now
        const res = await fetch(`${API_URL}/product/stock/${form.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(form.stock), // Sending plain int as per controller
        });

        if (res.ok) {
          toast({
            title: "Stock Updated",
            description: "Only stock quantity was updated.",
          });
          fetchProducts();
        }
      } else {
        // CREATE
        const res = await fetch(`${API_URL}/product`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            name: form.name,
            price: form.price,
            stock: form.stock,
          }),
        });

        if (res.ok) {
          toast({ title: "Product Created" });
          fetchProducts();
        }
      }
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Delete "${product.name}"?`)) {
      try {
        const res = await fetch(`${API_URL}/product/${product.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          setProducts(products.filter((p) => p.id !== product.id));
          toast({ title: "Product deleted", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", variant: "destructive" });
      }
    }
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setForm({ id: 0, name: "", price: 0, stock: 0, category: "General" });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            🛠️ Manage Products
          </h1>
          <p className="text-muted-foreground">
            Add products or update stock levels.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
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
        <Loader2 className="animate-spin" />
      ) : (
        <DataTable
          columns={[
            {
              header: "ID",
              accessorKey: "id",
              className: "font-mono text-sm w-20",
            },
            { header: "Name", accessorKey: "name", className: "font-medium" },
            {
              header: "Price",
              accessorKey: (row) => `$${row.price.toFixed(2)}`,
            },
            { header: "Stock", accessorKey: "stock" },
            {
              header: "Actions",
              accessorKey: (row) => (
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
              className: "text-right w-24",
            },
          ]}
          data={filteredProducts}
          emptyMessage="No products found."
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Product Stock" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                disabled={isEditing} // Name immutable on edit based on API
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  disabled={isEditing} // Price immutable on edit
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Only Stock can be updated currently.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Update Stock" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
