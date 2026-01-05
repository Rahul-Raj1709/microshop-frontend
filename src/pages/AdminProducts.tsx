import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  seller_id: number;
  category: string; // New Field
  description: string; // New Field
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial Form State
  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    seller_id: 0,
    category: "",
    description: "",
  });

  const { getToken, API_URL } = useAuth();

  // Debounce Logic: Wait 500ms after typing stops before updating debouncedSearch
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch when Page changes OR Search term changes
  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      let url = "";

      // 1. If Searching, use the Elastic Search Endpoint
      if (debouncedSearch.length > 0) {
        url = `${API_URL}/product/search?q=${encodeURIComponent(
          debouncedSearch
        )}`;
      }
      // 2. If NOT searching, use the standard DB Pagination
      else {
        url = `${API_URL}/product?page=${page}&pageSize=${pageSize}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();

      // Handle different structures (Search returns Array, DB returns Paged Object)
      if (Array.isArray(data)) {
        setProducts(data);
        // Elastic search in this simple setup returns a flat list, so we disable pagination controls
        setTotalCount(data.length);
        setTotalPages(1);
      } else if (data.items) {
        setProducts(data.items);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      };

      const body = JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });

      if (isEditing) {
        const res = await fetch(`${API_URL}/product/${form.id}`, {
          method: "PUT",
          headers,
          body,
        });
        if (!res.ok) throw new Error("Update failed");
        toast({ title: "Product Updated" });
      } else {
        const res = await fetch(`${API_URL}/product`, {
          method: "POST",
          headers,
          body,
        });
        if (!res.ok) throw new Error("Creation failed");
        toast({ title: "Product Created" });
      }

      fetchProducts();
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Operation failed.",
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
          fetchProducts();
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
    setForm({
      id: 0,
      name: "",
      price: 0,
      stock: 0,
      seller_id: 0,
      category: "",
      description: "",
    });
    setIsEditing(false);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            🛠️ Manage Products
          </h1>
          <p className="text-muted-foreground">
            Create, update, and manage your inventory.
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
        <>
          <DataTable
            columns={[
              { header: "ID", accessorKey: "id", className: "w-12 font-mono" },
              { header: "Name", accessorKey: "name", className: "font-medium" },
              { header: "Category", accessorKey: "category" }, // New Column
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
                      className="text-destructive"
                      onClick={() => handleDelete(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
                className: "text-right",
              },
            ]}
            // FIX: Pass 'products' directly. Do NOT filter client-side.
            data={products}
            emptyMessage="No products found."
          />

          {/* Pagination Controls (Hide if searching, as Elastic returns all matches) */}
          {debouncedSearch === "" && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-sm text-muted-foreground mr-4">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
                disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Category (New) */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Electronics, Books"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            {/* Description (New) */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
