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
import { Plus, Search, Trash2, UserCheck, UserX, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getClientId } from "@/lib/clientId";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Admin {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
}

export default function SuperAdmin() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const { getToken, API_URL } = useAuth();
  const queryClient = useQueryClient();

  // --- 1. Fetch Admins ---
  const { data: admins = [], isLoading } = useQuery<Admin[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/auth/admins`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch admins");
      return res.json();
    },
  });

  // --- 2. Create Admin Mutation ---
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/auth/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Creation failed");
      return text ? JSON.parse(text) : {};
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Admin ${form.username} created.`,
      });
      setDialogOpen(false);
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: (err: Error) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  // --- 3. Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/auth/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Admin removed." });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  // --- 4. Toggle Status Mutation ---
  const statusMutation = useMutation({
    mutationFn: async (admin: Admin) => {
      const updateRequest = {
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        isActive: !admin.isActive,
      };
      const res = await fetch(`${API_URL}/auth/${admin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
          ClientId: getClientId(),
        },
        body: JSON.stringify(updateRequest),
      });
      if (!res.ok) throw new Error("Update failed");
    },
    onSuccess: () => {
      toast({ title: "Status Updated" });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  // --- Handlers ---
  const handleCreate = () => {
    if (!form.username || !form.email || !form.password || !form.name) {
      toast({
        title: "Validation Error",
        description: "Fields marked * are required.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate();
  };

  const handleDelete = (admin: Admin) => {
    if (confirm(`Delete admin "${admin.username}"?`)) {
      deleteMutation.mutate(admin.id);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            👑 Manage Admins
          </h1>
          <p className="text-muted-foreground">
            Create and manage administrator accounts.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Admin
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={[
            {
              header: "ID",
              accessorKey: "id",
              className: "font-mono text-sm w-12",
            },
            { header: "Name", accessorKey: "name", className: "font-medium" },
            { header: "Username", accessorKey: "username" },
            { header: "Email", accessorKey: "email" },
            { header: "Phone", accessorKey: "phoneNumber" },
            {
              header: "Status",
              accessorKey: (row: Admin) => (
                <Badge variant={row.isActive ? "default" : "outline"}>
                  {row.isActive ? "Active" : "Inactive"}
                </Badge>
              ),
              className: "text-center",
            },
            {
              header: "Actions",
              accessorKey: (row: Admin) => (
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => statusMutation.mutate(row)}
                    disabled={statusMutation.isPending}>
                    {row.isActive ? (
                      <UserX className="h-4 w-4 text-warning" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-success" />
                    )}
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
          data={filteredAdmins}
          emptyMessage="No admins found."
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="jdoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  placeholder="+123..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Initial Password *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
