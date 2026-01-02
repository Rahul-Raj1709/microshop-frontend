import { useState } from "react";
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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const initialProducts: Product[] = [
  { id: "1", name: "Wireless Mouse Pro", price: 45, stock: 234, category: "Accessories" },
  { id: "2", name: "Mechanical Keyboard RGB", price: 129, stock: 89, category: "Accessories" },
  { id: "3", name: "USB-C Hub 7-in-1", price: 79, stock: 156, category: "Electronics" },
  { id: "4", name: "4K Webcam HD", price: 89, stock: 45, category: "Electronics" },
  { id: "5", name: "Monitor Stand Deluxe", price: 59, stock: 12, category: "Furniture" },
  { id: "6", name: "Desk Lamp LED", price: 39, stock: 0, category: "Lighting" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Product>({ id: "", name: "", price: 0, stock: 0, category: "" });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (isEditing) {
      setProducts(products.map((p) => (p.id === form.id ? form : p)));
      toast({ title: "Product updated", description: `${form.name} has been updated.` });
    } else {
      const newProduct = { ...form, id: Date.now().toString() };
      setProducts([...products, newProduct]);
      toast({ title: "Product added", description: `${form.name} has been added.` });
    }
    setDialogOpen(false);
    setForm({ id: "", name: "", price: 0, stock: 0, category: "" });
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Delete "${product.name}"?`)) {
      setProducts(products.filter((p) => p.id !== product.id));
      toast({ title: "Product deleted", description: `${product.name} has been removed.`, variant: "destructive" });
    }
  };

  const handleCreate = () => {
    setForm({ id: "", name: "", price: 0, stock: 0, category: "" });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 20) return <Badge variant="outline" className="border-warning text-warning">Low Stock</Badge>;
    return <Badge variant="secondary">{stock} in stock</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🛠️ Manage Products</h1>
          <p className="text-muted-foreground">Add, edit, or remove products from your catalog.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
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

      {/* Table */}
      <DataTable
        columns={[
          { header: "ID", accessorKey: "id", className: "font-mono text-sm w-20" },
          { header: "Name", accessorKey: "name", className: "font-medium" },
          { header: "Category", accessorKey: "category" },
          {
            header: "Price",
            accessorKey: (row) => `$${row.price.toFixed(2)}`,
            className: "text-right",
          },
          {
            header: "Stock",
            accessorKey: (row) => getStockBadge(row.stock),
            className: "text-center",
          },
          {
            header: "Actions",
            accessorKey: (row) => (
              <div className="flex justify-end gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
            className: "text-right w-24",
          },
        ]}
        data={filteredProducts}
        emptyMessage="No products found. Add your first product!"
      />

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Electronics, Accessories"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Add Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
