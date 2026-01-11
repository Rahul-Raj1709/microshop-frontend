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
  DialogDescription,
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
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getClientId } from "@/lib/clientId";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  seller_id: number;
  category: string;
  description: string;
}

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // --- Dialog States ---
  const [dialogOpen, setDialogOpen] = useState(false); // For Create/Edit
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // For Delete Confirmation
  const [isEditing, setIsEditing] = useState(false);

  // --- Form & Selection States ---
  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    stock: 0,
    seller_id: 0,
    category: "",
    description: "",
  });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { getToken, API_URL } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // --- 1. Fetch Products ---
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, debouncedSearch],
    queryFn: async () => {
      const headers = {
        Authorization: `Bearer ${getToken()}`,
        ClientId: getClientId(),
      };
      let url = "";

      if (debouncedSearch.length > 0) {
        url = `${API_URL}/product/search?q=${encodeURIComponent(
          debouncedSearch
        )}`;
      } else {
        url = `${API_URL}/product?page=${page}&pageSize=${pageSize}`;
      }

      const res = await fetch(url, { headers });
      if (res.status === 429) {
        navigate("/too-many-requests");
        throw new Error("Too many requests");
      }
      const jsonData = await res.json();

      if (Array.isArray(jsonData)) {
        return { items: jsonData, totalCount: jsonData.length, totalPages: 1 };
      } else if (jsonData.items) {
        return {
          items: jsonData.items,
          totalCount: jsonData.totalCount,
          totalPages: jsonData.totalPages,
        };
      }
      return { items: [], totalCount: 0, totalPages: 1 };
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.items || [];
  const totalPages = data?.totalPages || 1;

  // --- 2. Create / Update Mutation ---
  const saveMutation = useMutation({
    mutationFn: async (product: Product) => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ClientId: getClientId(),
      };
      const body = JSON.stringify({
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      });

      const url = isEditing
        ? `${API_URL}/product/${product.id}`
        : `${API_URL}/product`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, { method, headers, body });

      if (res.status === 429) {
        navigate("/too-many-requests");
        throw new Error("Too many requests");
      }

      if (!res.ok) throw new Error("Operation failed");

      // FIX: Handle both JSON and Plain Text responses
      const text = await res.text();
      try {
        // Try to parse as JSON
        return text ? JSON.parse(text) : {};
      } catch (e) {
        // If parsing fails (e.g. it's just "Product updated successfully"),
        // return the text or empty object. Since res.ok is true, it's a success.
        return {};
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: isEditing ? "Product Updated" : "Product Created" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Operation failed.",
        variant: "destructive",
      });
    },
  });

  // --- 3. Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/product/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });

      if (res.status === 429) {
        navigate("/too-many-requests");
        throw new Error("Too many requests");
      }

      if (!res.ok) throw new Error("Delete failed");

      // FIX: Handle both JSON and Plain Text responses safely
      const text = await res.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch (e) {
        // Ignore JSON parse errors for plain text responses
        return {};
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product deleted", variant: "destructive" });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive" });
    },
  });

  // --- Handlers ---
  const handleSave = () => {
    saveMutation.mutate(form);
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

  const handleEdit = (product: Product) => {
    setForm(product);
    setIsEditing(true);
    setDialogOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Actual Delete Action
  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
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

      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <DataTable<Product>
            columns={[
              { header: "ID", accessorKey: "id", className: "w-12 font-mono" },
              { header: "Name", accessorKey: "name", className: "font-medium" },
              { header: "Category", accessorKey: "category" },
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
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
                className: "text-right",
              },
            ]}
            data={products}
            emptyMessage="No products found."
          />

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

      {/* --- CREATE / EDIT DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
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
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{productToDelete?.name}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
